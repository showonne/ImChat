
window.onload = () => {

    var vApp = new Vue({
        el: "#vApp",
        data: {
            selected: true,
            notice: '',
            login_account: '',
            login_password: '',
            register_account: '',
            register_email: '',
            register_password: '',
            register_password_repeat: ''
        },
        methods: {
            toggle: function(val){
                this.selected = val;
            },
            isEmpty: function(strArr){
                var is = false;
                strArr.map(function(item){
                    if(/^\s*$/i.test(item)){
                        is = true;
                    }
                });
                return is;
            },
            subLogin: function(){
                if(this.isEmpty([this.login_account, this.login_password])){
                    this.notice = "账号名或密码不许为空";
                }else{
                    fetch('/logon', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            account: this.login_account,
                            password: this.login_password
                        })
                    })
                    .then(res => res.json())
                    .then(json => {
                            json.success == 0 ? vApp.$data.notice = json.msg : window.location.href = json.redirecturl;
                        });
                }
            },
            subRegister: function(){
                if(this.isEmpty([this.register_account, this.register_password, this.register_email, this.register_password_repeat])){
                    this.notice = "存在未填写选项";
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
                                    account: this.register_account,
                                    password: this.register_password,
                                    email: this.register_email
                                })
                            })
                            .then( res => res.json())
                            .then( json => { json.success == 0 ? vApp.$data.notice =  json.msg : window.location.href = json.redirecturl;})
                        }
                    }
                }
            }
        }
    });

    //particlesJS.load('particles-js', '/third-part/particles.json', () => { console.log('particles is done!') });
}