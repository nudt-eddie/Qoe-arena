#该文件主要实现将txt文件传入mysql数据库
import pymysql
import re
#变量初始化
con=pymysql.connect(
    host='localhost',
    port=3306,
    user='root',
    passwd='',
    db='user',
    charset='utf8',
    )
def insert(con,idname,time,servermd5,clientmd5,md5check):
    #数据库游标！
    cue = con.cursor()
    print("mysql connect succes")  # 测试语句，这在程序执行时非常有效的理解程序是否执行到这一步
    #try-except捕获执行异常
    try:
        cue.execute(
            "insert into results (id,time,servermd5,clientmd5,md5check) values(%s,%s,%s,%s,%s)",
            [id,time,servermd5,clientmd5,md5check])
        #执行sql语句
        # print("insert success")  # 测试语句
    except Exception as e:
        print('Insert error:', e)
        con.rollback()
        #报错反馈
    else:
        con.commit()
        #真正的执行语句
def read():
    filename=r'C:\Users\Lenovo\Desktop\first_version\public\Test\result.txt'
    #按行读取txt文本文档
    with open(filename, 'r') as f:
        datas = f.readlines()
    #遍历文件
    for data in datas:
        txt=re.split(r'\t|\n',data)
        idname=txt[0]
        time=txt[1]
        servermd5=txt[2]
        clientmd5=txt[3]
        md5check=txt[4]
        insert(con,idname,time,servermd5,clientmd5,md5check)
        #调用insert方法
    print("数据插入完成！")
read()
#执行read函数
con.close()
#关闭连接
