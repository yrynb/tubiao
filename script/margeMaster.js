const shell = require('shelljs')
console.log('切换到 master 分支')
shell.exec('git checkout master')
console.log('将 develop 分支合并到 master 分支上')
shell.exec('git merge --no-ff develop')

console.log('提交代码')
shell.exec('git push')

console.log('切换分支到 develop')
shell.exec('git checkout develop')
// shell.exit(1);