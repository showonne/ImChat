'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

window.onload = function () {
    var vApp = function (_Vue) {
        _inherits(vApp, _Vue);

        function vApp() {
            _classCallCheck(this, vApp);

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
            return _possibleConstructorReturn(this, Object.getPrototypeOf(vApp).call(this, props));
        }

        _createClass(vApp, [{
            key: 'toggle',
            value: function toggle(val) {
                this.selected = val;
            }
        }, {
            key: 'isEmpty',
            value: function isEmpty(strArr) {
                var is = false;
                strArr.map(function (item) {
                    if (/^\s*$/i.test(item)) {
                        is = true;
                    }
                });
                return is;
            }
        }, {
            key: 'subLogin',
            value: function subLogin() {
                if (vapp.isEmpty([vapp._data.login_account, vapp._data.login_password])) {
                    vapp._data.notice = "账号名或密码不许为空";
                } else {
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
                    }).then(function (res) {
                        return res.json();
                    }).then(function (json) {
                        console.log(json);
                        json.success == 0 ? vapp._data.notice = json.msg : window.location.href = json.redirecturl;
                    });
                }
            }
        }, {
            key: 'subRegister',
            value: function subRegister() {
                if (vapp.isEmpty([vapp._data.register_account, vapp._data.register_password, vapp._data.register_email, vapp._data.register_password_repeat])) {
                    vapp._data.notice = "存在未填写选项";
                } else {
                    if (/\W|\_/i.test(this.register_account)) {
                        this.notice = "不允许使用空格,下划线等特殊字符为帐号.";
                    } else {
                        if (this.register_password != this.register_password_repeat) {
                            this.notice = "两次密码输入不一致";
                        } else {
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
                            }).then(function (res) {
                                return res.json();
                            }).then(function (json) {
                                json.success == 0 ? vapp._data.notice = json.msg : window.location.href = json.redirecturl;
                            });
                        }
                    }
                }
            }
        }]);

        return vApp;
    }(Vue);

    var vapp = new vApp();

    // particlesJS.load('particles-js', '/third-part/particles.json', () => { console.log('particles is done!') });
};