@echo off
set /p gd=����Ҫ�����ʷ�ύ��Ϣ�ķ�֧:
echo ������ķ�֧��%gd%
set /p gm=�����ύ˵����
git checkout --orphan temp_branch
git add -A
git commit -am "%gm%"
git branch -D %gd%
git branch -m %gd%
echo "�����ȫ������ʷ��¼!"
echo "�鿴�²ֿ���Ϣ��"
git log --pretty=oneline
git branch -a
git tag
git ls-remote --tags

choice /t 5 /n /d y /m 5����Զ��˳�����N��ȡ������
if %errorlevel%==2 (
    echo �Զ��˳���ȡ����
    pause
)
exit