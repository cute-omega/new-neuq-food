@echo off
set /p gd=输入要清除历史提交信息的分支:
echo 待处理的分支：%gd%
set /p gm=输入提交说明：
git checkout --orphan temp_branch
git add -A
git commit -am "%gm%"
git branch -D %gd%
git branch -m %gd%
echo "已清除全部的历史记录!"
echo "查看新仓库信息："
git log --pretty=oneline
git branch -a
git tag
git ls-remote --tags

choice /t 5 /n /d y /m 5秒后自动退出，按N键取消……
if %errorlevel%==2 (
    echo 自动退出被取消。
    pause
)
exit