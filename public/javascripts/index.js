
window.onload = () => {
    class vApp extends Vue {
        constructor () {
            var props = {
                el: '#vApp',
                data: {
                    selected: true,
                    notice: '',
                    login_account: '',
                    login_password: '',
                    register_account: '',
                    register_email: '',
                    register_password: '',
                    register_password_repeat: ''
                }
            };
            super(props);
        }
        toggle (val) {
            this.selected = val;
        }
        isEmpty (strArr) {
            var is = false;
            strArr.map(item => {
                if(/^\s*$/i.test(item)){
                    is = true;
                }
            });
            return is;
        }
        subLogin () {
            if(vapp.isEmpty([vapp._data.login_account, vapp._data.login_password])){
                vapp._data.notice = "账号名或密码不许为空";
            }else{
                fetch('/logon', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        account: vapp._data.login_account,
                        password: vapp._data.login_password
                    })
                })
                .then(res => res.json())
                .then(json => {
                        console.log(json);
                        json.success == 0 ? vapp._data.notice = json.msg : window.location.href = json.redirecturl;
                    });
            }
        }
        subRegister () {
            if(vapp.isEmpty([vapp._data.register_account, vapp._data.register_password, vapp._data.register_email, vapp._data.register_password_repeat])){
                vapp._data.notice = "存在未填写选项";
            }else{
                if(/\W|\_/i.test(this.register_account)){
                    this.notice = "不允许使用空格,下划线等特殊字符为帐号.";
                }else{
                    if(this.register_password != this.register_password_repeat){
                        this.notice = "两次密码输入不一致";
                    }else{
                        fetch('/register', {
                            method: 'post',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                account: vapp._data.register_account,
                                password: vapp._data.register_password,
                                email: vapp._data.register_email
                            })
                        })
                        .then( res => res.json())
                        .then( json => { json.success == 0 ? vapp._data.notice =  json.msg : window.location.href = json.redirecturl;})
                    }
                }
            }
        }
    }

    var vapp = new vApp();

    particlesJS.load('particles-js', '/third-part/particles.json', () => { console.log('particles is done!') });
}