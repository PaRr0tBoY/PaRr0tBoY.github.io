#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
B站视频字幕提取工具

仿照 SubBatch Chrome 扩展的实现，提取 B站视频字幕并保存为 SRT 格式。
"""

import re
import json
import time
import hashlib
import argparse
from typing import Optional, Dict, List, Tuple
from urllib.parse import urlparse, parse_qs

import requests


# 混淆 key 排列表（与扩展中的 mixinKeyEncTab 一致）
MIXIN_KEY_ENC_TAB = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62,
    11, 36, 20, 34, 44, 52,
]

# B站 Cookie（直接配置在这里）
DEFAULT_SESSDATA = '3af11b2e%2C1788528397%2Cc356b%2A31CjD3AamTNGd5VW6gIq3hwVwQxLDB4JwuMCELK-aJ1LOXP-IvzqSHQKpFe9uXp0rDyoASVm15ZF9IZWhUR1hnR0g0c3NZZFVQS294dmVGd041TlZFU3pJWDNnQlA4MTBQdXJaTzl0Y2VqU0dTaFU4b2FfdHNDV0NOWGsyV3VSdnFENllleTNwalhBIIEC'
DEFAULT_BILI_JCT = '2c0f74c10272a8006f2edff1908dfe15'
DEFAULT_DEDE_USER_ID = '109167641'

# 默认 Cookie
DEFAULT_COOKIE = f'SESSDATA={DEFAULT_SESSDATA}; bili_jct={DEFAULT_BILI_JCT}; DedeUserID={DEFAULT_DEDE_USER_ID}'


class BilibiliSubtitleExtractor:
    """B站字幕提取器"""

    def __init__(self, cookie: Optional[str] = None):
        """
        初始化

        Args:
            cookie: B站 Cookie，某些视频需要登录才能访问
        """
        self.cookie = cookie
        self.session = requests.Session()

        # 通用请求头（与扩展中的完全一致）
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Origin': 'https://www.bilibili.com',
            'Referer': 'https://www.bilibili.com/',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'X-Wbi-UA': 'Win32.Chrome.109.0.0.0',
        }

        if cookie:
            self.headers['Cookie'] = cookie

        # WBI 签名密钥缓存
        self._wbi_keys_cache: Optional[Tuple[str, str]] = None
        self._wbi_keys_cache_time: float = 0

    @staticmethod
    def parse_video_url(url_or_bvid: str) -> str:
        """
        解析视频链接，提取 BV 号

        Args:
            url_or_bvid: 视频链接或 BV 号

        Returns:
            BV 号（保持原始大小写，BV 号大小写敏感）

        Raises:
            ValueError: 无法解析出有效的 BV 号
        """
        # 如果直接是 BV 号
        if url_or_bvid.upper().startswith('BV'):
            # BV 号大小写敏感，直接返回原始值
            return url_or_bvid

        # 如果是完整 URL
        patterns = [
            r'bilibili\.com/video/(BV[a-zA-Z0-9]+)',
            r'b23\.tv/([a-zA-Z0-9]+)',  # 短链接
            r'BV([a-zA-Z0-9]{10})',  # 不带 BV 前缀的 10 位
        ]

        for pattern in patterns:
            match = re.search(pattern, url_or_bvid)
            if match:
                bv = match.group(1)
                # 确保带 BV 前缀
                if not bv.upper().startswith('BV'):
                    bv = 'BV' + bv
                return bv

        raise ValueError(f'无法从 "{url_or_bvid}" 中解析出有效的 BV 号')

    def get_video_info(self, bvid: str) -> Dict:
        """
        获取视频基本信息

        Args:
            bvid: BV 号

        Returns:
            视频信息字典，包含 aid, cid, title 等
        """
        url = f'https://api.bilibili.com/x/web-interface/view?bvid={bvid}'

        response = self.session.get(url, headers=self.headers)
        data = response.json()

        if data.get('code') != 0:
            raise Exception(f"获取视频信息失败: {data.get('message')}")

        video_data = data['data']

        # 获取 cid（第一个分 P）
        cid = video_data.get('cid')
        if not cid and video_data.get('pages'):
            cid = video_data['pages'][0]['cid']

        if not cid:
            raise Exception("无法获取视频 CID")

        return {
            'aid': video_data['aid'],
            'bvid': video_data['bvid'],
            'cid': cid,
            'title': video_data['title'],
            'author': video_data['owner']['name'],
        }

    def get_wbi_keys(self) -> Tuple[str, str]:
        """
        获取 WBI 签名密钥

        Returns:
            (img_key, sub_key) 元组
        """
        # 检查缓存（密钥有效期通常为一天）
        if self._wbi_keys_cache and time.time() - self._wbi_keys_cache_time < 3600 * 12:
            return self._wbi_keys_cache

        url = 'https://api.bilibili.com/x/web-interface/nav'

        response = self.session.get(url, headers=self.headers)
        data = response.json()

        if data.get('code') != 0:
            raise Exception(f"获取 WBI 密钥失败: {data.get('message')}")

        img_url = data['data']['wbi_img']['img_url']
        sub_url = data['data']['wbi_img']['sub_url']

        # 从 URL 中提取文件名
        img_key = img_url.split('/')[-1].split('.')[0]
        sub_key = sub_url.split('/')[-1].split('.')[0]

        self._wbi_keys_cache = (img_key, sub_key)
        self._wbi_keys_cache_time = time.time()

        return img_key, sub_key

    @staticmethod
    def get_mixin_key(img_key: str, sub_key: str) -> str:
        """
        生成混淆密钥

        Args:
            img_key: img 密钥
            sub_key: sub 密钥

        Returns:
            32 位的混淆密钥
        """
        orig = img_key + sub_key
        temp = ''.join(orig[n] for n in MIXIN_KEY_ENC_TAB)
        return temp[:32]

    @staticmethod
    def enc_wbi(params: Dict, img_key: str, sub_key: str) -> str:
        """
        生成 WBI 签名查询字符串

        Args:
            params: 请求参数字典
            img_key: img 密钥
            sub_key: sub 密钥

        Returns:
            签名后的查询字符串
        """
        mixin_key = BilibiliSubtitleExtractor.get_mixin_key(img_key, sub_key)
        curr_time = int(time.time())

        # 添加时间戳
        params = dict(params)  # 复制避免修改原字典
        params['wts'] = curr_time

        # 过滤特殊字符
        chr_filter = re.compile(r"[!'()*]")
        query_parts = []
        for key in sorted(params.keys()):
            value = str(params[key])
            value = chr_filter.sub('', value)
            query_parts.append(f"{key}={value}")

        query = '&'.join(query_parts)

        # 生成签名
        sign_str = query + mixin_key
        w_rid = hashlib.md5(sign_str.encode()).hexdigest()

        return query + '&w_rid=' + w_rid

    def get_subtitle_info(self, aid: int, cid: int) -> Optional[Dict]:
        """
        获取字幕信息

        Args:
            aid: 视频 aid
            cid: 视频 cid

        Returns:
            字幕信息字典，如果失败返回 None
        """
        try:
            # 获取 WBI 密钥
            img_key, sub_key = self.get_wbi_keys()

            # 生成签名参数
            params = {
                'aid': aid,
                'cid': cid,
            }
            query = self.enc_wbi(params, img_key, sub_key)

            url = f'https://api.bilibili.com/x/player/wbi/v2?{query}'

            response = self.session.get(url, headers=self.headers)
            data = response.json()

            if data.get('code') != 0:
                print(f"获取字幕信息失败: {data.get('message')}")
                return None

            subtitle_data = data['data'].get('subtitle')
            if not subtitle_data:
                print("该视频没有字幕")
                return None

            subtitles = subtitle_data.get('subtitles', [])
            if not subtitles:
                print("字幕列表为空")
                return None

            # 优先选择中文字幕
            default_subtitle = None
            for sub in subtitles:
                if sub.get('lan') == 'ai-zh':
                    default_subtitle = sub
                    break

            if not default_subtitle:
                # 如果没有 AI 中文字幕，选择第一个
                default_subtitle = subtitles[0]

            print(f"找到字幕: {default_subtitle.get('lan_doc', '未知')}")

            return default_subtitle

        except Exception as e:
            print(f"获取字幕信息时出错: {e}")
            return None

    def get_ai_subtitle_url(self, aid: int, cid: int, bvid: str) -> Optional[str]:
        """
        获取 AI 自动生成字幕的 URL

        Args:
            aid: 视频 aid
            cid: 视频 cid
            bvid: BV 号

        Returns:
            字幕 URL，如果失败返回 None
        """
        try:
            url = f'https://api.bilibili.com/x/player/v2/ai/subtitle/search/stat?aid={aid}&cid={cid}'

            headers = dict(self.headers)
            headers['Referer'] = f'https://www.bilibili.com/video/{bvid}'

            response = self.session.get(url, headers=headers)
            data = response.json()

            if data.get('code') == 0 and data.get('data'):
                subtitle_url = data['data'].get('subtitle_url')
                if subtitle_url:
                    return self._format_subtitle_url(subtitle_url)

            return None

        except Exception as e:
            print(f"获取 AI 字幕 URL 时出错: {e}")
            return None

    @staticmethod
    def _format_subtitle_url(url: str) -> str:
        """格式化字幕 URL"""
        if not url:
            return ''
        if url.startswith('//'):
            return 'https:' + url
        if not url.startswith('http://') and not url.startswith('https://'):
            return 'https://' + url
        return url

    def get_subtitle_content(self, subtitle_url: str, bvid: str) -> Optional[List[Dict]]:
        """
        获取字幕内容

        Args:
            subtitle_url: 字幕 URL
            bvid: BV 号

        Returns:
            字幕内容列表，格式为 [{from: 开始秒数, to: 结束秒数, content: 文本}, ...]
        """
        try:
            headers = dict(self.headers)
            headers['Referer'] = f'https://www.bilibili.com/video/{bvid}'

            response = self.session.get(subtitle_url, headers=headers)
            data = response.json()

            # 检查 AI 字幕格式
            if data.get('type') == 'AIsubtitle' and 'body' in data:
                return data['body']

            # 普通字幕格式
            if 'body' in data:
                return data['body']

            print(f"未知字幕格式: {data.keys()}")
            return None

        except Exception as e:
            print(f"获取字幕内容时出错: {e}")
            return None

    @staticmethod
    def format_time(seconds: float) -> str:
        """
        将秒数格式化为 SRT 时间格式

        Args:
            seconds: 秒数

        Returns:
            格式化后的时间字符串，如 "00:01:23,456"
        """
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)

        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    def to_srt(self, subtitles: List[Dict]) -> str:
        """
        将字幕内容转换为 SRT 格式

        Args:
            subtitles: 字幕内容列表

        Returns:
            SRT 格式的字符串
        """
        srt_lines = []

        for i, item in enumerate(subtitles, 1):
            start_time = self.format_time(item['from'])
            end_time = self.format_time(item['to'])
            content = item['content']

            srt_lines.append(f"{i}")
            srt_lines.append(f"{start_time} --> {end_time}")
            srt_lines.append(content)
            srt_lines.append("")

        return '\n'.join(srt_lines)

    def extract_subtitle(self, url_or_bvid: str, output_file: Optional[str] = None) -> str:
        """
        提取视频字幕

        Args:
            url_or_bvid: 视频链接或 BV 号
            output_file: 输出文件名，如果为 None 则使用视频标题

        Returns:
            SRT 格式的字幕内容
        """
        # 解析 BV 号
        bvid = self.parse_video_url(url_or_bvid)
        print(f"解析 BV 号: {bvid}")

        # 获取视频信息
        video_info = self.get_video_info(bvid)
        print(f"视频: {video_info['title']}")
        print(f"UP 主: {video_info['author']}")
        print(f"AID: {video_info['aid']}, CID: {video_info['cid']}")

        # 获取字幕信息
        subtitle_info = self.get_subtitle_info(video_info['aid'], video_info['cid'])

        if not subtitle_info:
            raise Exception("无法获取字幕信息")

        subtitle_url = subtitle_info.get('subtitle_url')

        # 如果是 AI 字幕且 URL 为空，需要额外请求
        if not subtitle_url and subtitle_info.get('lan', '').startswith('ai-'):
            print("检测到 AI 自动生成字幕，获取字幕 URL...")
            subtitle_url = self.get_ai_subtitle_url(video_info['aid'], video_info['cid'], bvid)

        if not subtitle_url:
            raise Exception("无法获取字幕 URL")

        # 格式化 URL
        subtitle_url = self._format_subtitle_url(subtitle_url)
        print(f"字幕 URL: {subtitle_url}")

        # 获取字幕内容
        subtitles = self.get_subtitle_content(subtitle_url, bvid)

        if not subtitles:
            raise Exception("无法获取字幕内容")

        print(f"成功获取 {len(subtitles)} 条字幕")

        # 转换为 SRT 格式
        srt_content = self.to_srt(subtitles)

        # 保存文件
        if output_file is None:
            # 清理文件名，移除非法字符
            safe_title = re.sub(r'[\\/*?:"<>|]', '', video_info['title'])
            output_file = f"{safe_title}.srt"

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(srt_content)

        print(f"字幕已保存到: {output_file}")

        return srt_content


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='B站视频字幕提取工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
示例:
  # 使用 BV 号
  python bilibili_subtitle.py BV1xx411c7mD

  # 使用完整 URL
  python bilibili_subtitle.py https://www.bilibili.com/video/BV1xx411c7mD

  # 指定输出文件
  python bilibili_subtitle.py BV1xx411c7mD -o my_subtitle.srt

  # 使用 Cookie（适用于需要登录的视频）
  python bilibili_subtitle.py BV1xx411c7mD --cookie "SESSDATA=xxx; bili_jct=xxx"
        '''
    )

    parser.add_argument('url', help='视频链接或 BV 号')
    parser.add_argument('-o', '--output', help='输出文件名（默认使用视频标题）')
    parser.add_argument('-c', '--cookie', help='B站 Cookie（某些视频需要登录）')

    args = parser.parse_args()

    # 如果没有提供 Cookie，使用默认配置
    cookie = args.cookie if args.cookie else DEFAULT_COOKIE

    try:
        extractor = BilibiliSubtitleExtractor(cookie=cookie)
        extractor.extract_subtitle(args.url, args.output)

    except Exception as e:
        print(f"错误: {e}")
        exit(1)


if __name__ == '__main__':
    main()
