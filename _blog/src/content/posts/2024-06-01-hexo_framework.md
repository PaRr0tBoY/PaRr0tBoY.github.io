---
author: Acid
pubDatetime: 2024-06-01T00:00:00.000Z
title: "Hexo框架迁移记录"
slug: hexo_framework
featured: false
draft: false
tags:
  - 技术
  - 日记
  - Hexo框架
description: "题记：本篇介绍用Hexo框架构建博客的经历"
ogImage: /img/posts/hexo_framework/cover.png
---

去年弄了基于wordpress的博客，然而碍于备案太麻烦，专门去国外平台租了服务器，买了域名，一番折腾后终于把网站挂在了租来的服务器，不过没几天就被黑客打下来了，我又没有什么运维知识，最终只能不了了之。

后续听说了Github Pages，由Github免费提供的网页寄存服务，可以存放静态网页，包括博客、项目文档、甚至整本书。最重要的是因为网页托管在github那边，因此几乎没有被黑客攻击的风险。

于是今年五月初心血来潮将博客部署在GitHubPages，随便找了个jekyll主题，[然后把默认的url解析到去年购买的闲置域名ac1d.cc](http://xn--urlac1d-tk4kv2z42d2zafa128j7nwe6n83stp1bq7tia4576b947bdcis8ir18c0q7b.cc)，配置好cname后自动转发到www前缀，在这之后就放着没管，只是有兴致时写一两篇博文，往往很短，只是随手一记。

这期间上网查阅资料时偶然打开了sukka的博客，顿觉界面十分清爽，三栏布局深得我心。迅速阅览后得知sukka的博客是用hexo框架建立的，于是在阅读官方文档后，我在计算机上安装了Hexo框架，并init了第一个博客文件夹，一开始我想用metarial主题，但是不知为何总是报一堆错，metarial的文档写的也很烂，令人不知所云，最后选择了icarus主题，部署好后终端键入’hexo server’，然后就可以在localhost的4000端口打开博客的预览界面。一番修改后就变成了现在的样子，具体变更可以参阅导航栏上的变更日志。