def git_auth = "0e9c42d7-2a85-4b87-a51c-3a6c2e5e90dd"
def git_url = "git@git.uino.com:udatav/spray-conch.git"
def deploy_path = "/home/admin/nginx/html/conch"
node {
    def start = new Date().format('yyyy-MM-dd HH:mm:ss')
    def projectInfo = "$JOB_NAME"
    def head = "\"构建${JOB_NAME}：#${env.BUILD_ID}<font color=\\\"info\\\">成功</font>，详细信息如下:"
    wrap([$class: 'BuildUser']) {
        script {
            BUILD_USER = "${env.BUILD_USER}"
        }
    }
    stage('拉取代码') {
        checkout([$class: 'GitSCM', branches: [[name: "*/${branch}"]], extensions: [], userRemoteConfigs: [[credentialsId: "${git_auth}", url: "${git_url}"]]])
    } 
    stage('打包') {
        try{
            //环境变量生效
            sh 'if [ ! -d "node_modules" ]; then source ~/.bashrc && cnpm i; fi'
            //环境变量生效
            sh 'source ~/.bashrc && npm run build'
            sh "rm -rf /home/admin/nginx-1.20.1/html/conch/*"
            sh "cp -r dist/* /home/admin/nginx-1.20.1/html/conch"
        }catch(err){
            head = "\"构建${projectInfo}：#${env.BUILD_ID}<font color=\\\"warning\\\">失败</font>，异常信息："+err.toString()
            throw err
        }finally{
             def s1 = ">部署分支：<font color=\\\"comment\\\">${branch}</font>"
             def s2 = ">部署项目：<font color=\\\"comment\\\">${projectInfo}</font>"
             def execTime = start+"   "+new Date().format('yyyy-MM-dd HH:mm:ss')
             def s4 = ">部署时间：<font color=\\\"comment\\\">${execTime}</font>"
             def s5 = ">部署人：<font color=\\\"comment\\\">${BUILD_USER}</font>"
             def msg = "${head}"+"\n"+ "${s1}"+"\n"+"${s2}"+"\n"+"${s4}"+"\n"+"${s5}\""
             def body = "{ \"msgtype\": \"markdown\", \"markdown\": { \"content\": ${msg} } }"
             echo "${body}"
             httpRequest contentType: 'APPLICATION_JSON_UTF8', httpMode: 'POST', requestBody: "${body}", responseHandle: 'NONE', url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=b725a2f3-a4c7-4104-8893-a98961605ff2', wrapAsMultipart: false
         }

    }
}
