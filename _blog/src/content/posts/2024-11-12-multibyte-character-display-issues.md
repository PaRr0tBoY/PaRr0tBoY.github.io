---
author: Acid
pubDatetime: 2024-11-12T00:00:00.000Z
title: "SQL Server Practice: Multibyte Characters Displayed With Incorrect Encoding"
slug: multibyte-character-display-issues
featured: false
draft: false
tags:
  - 数据库
  - 微软
  - 编码
  - debug
  - 笔记
description: "Insight of why all multibyte character is printed as ‘?’"
ogImage: /img/posts/multibyte-character-display-issues/cover.png
---

## The Issues

So in this semester.I took a database course and we use sql server as learning materials which is a headache for me.Since I use mac as my main working pc while Microsoft developed the sql server so it’s natural that sql server is not compatible for mac. To install it on my Mac, I have to borrow the power of virtual machine. After careful consideration of convenience and performance issues, I decided to use containers to install it. As an alternative to Docker, I chose Orbstack. It gave me a native Mac vibe while being free (for personal use). With simplicity and high performance, Orbstack is my best choice and imho the best option for any mac user with container requirements (I’m not their salesman tho).I have previously written a step by step guide on how to install sql server on mac with container. Check that article if needed. The main topic of this article came to me when I was dealing with the professor’s assignment. When I tried to select a few rows from a given table, it turned out that all the Chinese characters were displayed as question marks, which is quite tricky since in this case I cannot get the correct result set when Chinese characters are contained in the WHERE clause. All Chinese characters are recognised as ‘?’ by the DBMS, so the WHERE clause has lost all meaning.

![Chinese was not correctly encoded in the new query page.](/img/posts/multibyte-character-display-issues/image-1.png)

![Chinese was not correctly encoded in the result set.](/img/posts/multibyte-character-display-issues/image-2.png)

## The Analyze

It occurs to me that ‘?’ means the DBMS used the wrong decoding for Chinese characters, which is why all Chinese characters are displayed as ‘?’, because the DBMS couldn’t find the correct symbol to display the Chinese character. So the actual problem is how to tell the DBMS to use the correct decoding. I tried to look this up in the settings with the keyword ‘encoding’ and found the following setting picture below. After changing it to Simplified Chinese (GB18030), I restarted Azure Data Studio and found that this fixed the display of Chinese characters in the new query page. However, the Chinese characters in the result set are still a mess.

![The encoding setting](/img/posts/multibyte-character-display-issues/image-3.png)

## The Research

Later, after looking at the[Official Sql Server Website](https://learn.microsoft.com/en-us/sql/t-sql/data-types/nchar-and-nvarchar-transact-sql?view=sql-server-ver16), I found this very useful information.

> Prefix a Unicode character string constants with the letter N to signal UCS-2 or UTF-16 input, depending on whether an SC collation is used or not. Without the N prefix, the string is converted to the default code page of the database that might not recognize certain characters.

So I have two options: Either replace all char/varchar to nchar/nvarchar or use an SC (Supplementary Characters) collation. I decided to try the former first.

I drop the database with the code snippets below. To avoid crashes and accidental data corruption, we should set the database to single user mode and drop it. Also note that all connections to the database to be dropped should be disconnected before running the following code.
1
2
3
ALTER DATABASE database_name SET SINGLE_USER WITH ROLLBACK IMMEDIATE; --Set Single User mode

DROP DATABASE database_name --Drop Database with database name

![The execution result](/img/posts/multibyte-character-display-issues/image-4.png)

After running the above code, make sure thatdatabase_nameis actually dropped. Then recreate the database and tables to see if Chinese characters (or other multi-byte characters) are displayed correctly.

Turns out mine works fine.

![The correct version of select result](/img/posts/multibyte-character-display-issues/image-5.png)

There is another way: Set the SC collation. After looking through[Collation and unicode support](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver16), I got thisChinese_PRC_CI_AS. So I dropped and recreated the database with the code below and recreated all the tables, multi-byte characters (Chinese) displayed correctly again.
1
2
CREATE DATABASE database_name --Create Database 'database_name'
COLLATE Chinese_PRC_CI_AS; --Enable Chinese_PRC_CI_AS Collation for database

After all, this is just another encoding problem. It’s possible that if we don’t explicitly enable SC collation, the string will fall back to the default codepage, which may not recognise certain multibyte characters. These characters are outside the range of datatypes stored under non-SC collation, so we might need to explicitly enable SC collation or use the N prefix to signal UCS-2 or UTF-16 input.

## References

[collation-and-unicodode](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver16)

[nchar-and-nvarchar-transact-sql](https://learn.microsoft.com/en-us/sql/t-sql/data-types/nchar-and-nvarchar-transact-sql?view=sql-server-ver16)

[resolve-garbled-characters-in-tables-of-sql-server-databases](https://help.aliyun.com/zh/rds/apsaradb-rds-for-sql-server/resolve-garbled-characters-in-tables-of-sql-server-databases)

[解决 SqlServer中文乱码问题](https://www.cnblogs.com/listjiang/p/16504594.html)

[what-is-the-difference-between-varchar-and-nvarchar](https://stackoverflow.com/questions/144283/what-is-the-difference-between-varchar-and-nvarchar)