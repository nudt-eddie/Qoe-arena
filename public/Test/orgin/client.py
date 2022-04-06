#coding=utf8

'''
客户端 udp协议 方法：

1.通过多线程实现停等协议来进行可靠传输，
2.通过压缩、分块实现文件的快速重传
3.服务端接收后进行解压缩操作

'''

import socket
import os
import hashlib
from os.path import basename
from threading import Thread,Event
from time import sleep
import zipfile
import gzip
#-------------------------------配置--------------------------------------------
#------------------------------config--------------------------------------------

ip='10.129.84.222'#server的ip
port=7777        #server的port
BUFFER_SIZE= 4*1024*1024   #4G进行分块处理
dst='file.txt'   #目的文件夹
port_ack=7778    #发送给server端ack消息的端口

fn_path='output.bin'
fn_path_zip=fn_path+".gz"

ack_address=(ip,port_ack)
#------------------------------大文件压缩-------------------------------------------


BufSize = 1024*32

def gZipFile(src, dst):
  fin = open(src, 'rb')
  fout = gzip.open(dst, 'wb')
  in2out(fin, fout)

def gunZipFile(gzFile, dst):
  fin = gzip.open(gzFile, 'rb')
  fout = open(dst, 'wb')
  in2out(fin, fout)

def in2out(fin, fout):
  while True:
    buf = fin.read(BufSize)
    if len(buf) < 1:
      break
    fout.write(buf)
  fin.close()
  fout.close()    #关闭文件

#------------------------------中间文件-------------------------------------------
#用来临时保存数据
data=set()

#接收数据的socket
sock_recv=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
sock_recv.bind(('',port))

#确认反馈地址

sock_ack=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)

#重复收包次数
repeat=0

while True:
    buffer,_=sock_recv.recvfrom(BUFFER_SIZE)
    #全部接收完成，获取文件名
    if buffer.startswith(b'over_'):
        fn=buffer[5:].decode()
        #多确认几次文件传输结束，防止发送方丢包收不到确认
        for i in range(5):
            sock_ack.sendto(fn.encode()+b'_ack',ack_address)
        break
    buffer=tuple(buffer.split(b'_',maxsplit=1))
    if buffer in data:
        repeat=repeat+1
    else:
        data.add(buffer)
    sock_ack.sendto(buffer[0]+b'_ack',ack_address)
sock_recv.close()
sock_ack.close()


data=sorted(data,key=lambda item:int(item[0]))
with open(rf'{fn}','wb') as fp:
    for item in data:
        fp.write(item[1])

#gunZipFile(fn_path_zip,dst)

