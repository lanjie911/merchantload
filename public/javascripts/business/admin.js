let vInst = null;

vInst = new Vue({
    el: "#worksarea",
    data: {
        uiHeight: 100,
        uiMargin: 160,
        activeTabIndex: "0",

        //请求列表属性
        pageSize: 10,
        totalCount: 0,
        currentPage: 1,
        reqDataSet: [],
        requestBeginDate: "",
        requestEndDate: "",

        //管理员属性
        isLoadAdmData: false,
        merAdminDataSet: [],
        meradmcurrentPage: 1,
        meradmpageSize: 10,
        meradmTotalCount: 0,

        //修改密码数据
        oldPwd: "",
        newPwd: "",
        newPwdAffirm: "",

        //管理员弹出窗体
        dialogVisible: false,
        beanAdmStat: true,
        beanAdmName: "",
        beanAdmMobile: "",
        beanAdmAcc: "",
        beanAdmPwd: "",
        oper: "创建管理员",
        currentSelectedAdminId: 0,

        //推广短信的字段
        smsDataSet: [],
        smsBeginDate: "",
        smsEndDate: "",
        smsPageSize: 10,
        smsCurrentPage: 1,
        smsTotalCount: 0,
        isLoadSmsData: false,

        //验证码短信的字段
        vcodeDataSet: [],
        vcodeMobile: "",
        vcodeBeginDate: "",
        vcodeEndDate: "",
        vcodePageSize: 10,
        vcodeCurrentPage: 1,
        vcodeTotalCount: 0,
        isLoadVcodeData: false
    },
    created: function () {
        this.uiHeight = document.documentElement.clientHeight;
    },
    mounted: function () {
        this.qryList('req', 1, this.handleReqPara, this.handleReqArray);
    },
    computed: {
        calcHeight: function () {
            return this.uiHeight - this.uiMargin;
        },
        containerHeight: function () {
            return this.calcHeight - 2;
        },
        asideHeight: function () {
            return this.containerHeight - 2;
        },
        mainHeight: function () {
            return this.asideHeight;
        }
    },
    methods: {
        checkTabsExist: function (tabIdx) {
            for (let i = 0; i < this.editableTabs.length; i++) {
                let element = this.editableTabs[i];
                if (element.name == tabIdx) {
                    return true;
                }
            }
            return false;
        },
        gofunc: function (idx) {
            document.getElementById("tab-" + idx).style.display = "";
            document.getElementById("pane-" + idx).style.display = "";
            document.getElementById("tab-" + idx).click();

        },
        // 关闭标签
        tabRemoved: function (tabIdx) {
            console.log("tab index is %s", tabIdx);
            document.getElementById("tab-" + tabIdx).style.display = "none";
            document.getElementById("pane-" + tabIdx).style.display = "none";
        },
        // 点击标签
        tabClicked: function (tabObj) {
            let tabIdx = tabObj.index;

            // 加载推广短信列表
            if (tabIdx == 1) {
                if (this.isLoadSmsData) {
                    return;
                }
                this.qryList('sms', 1, this.handleSMSPara, this.handleSMSArray);
                return;
            }

            // 加载验证码短信列表
            if (tabIdx == 2) {
                if (this.isLoadVcodeData) {
                    return;
                }
                this.qryList('vcode', 1, this.handleVcodePara,this.handleVcodeArray);
                return;
            }

            // 加载用户列表数据
            if (tabIdx == 3) {
                if (this.isLoadAdmData) {
                    return;
                }
                this.qryList('admin', 1, this.handleAdminPara, this.handleAdminArray);
                return;
            }
        },
        // 请求列表翻页
        goPage: function (pageNumber) {
            this.qryList('req', pageNumber, this.handleReqPara,this.handleReqArray);
        },

        //管理员翻页方法
        goMerAdmPage: function (pageNumber) {
            this.qryList('admin', pageNumber, this.handleAdminPara, this.handleAdminArray);
        },
        // 短信翻页
        goSmsPage: function (pageNumber) {
            this.qryList('sms', pageNumber, this.handleSMSPara, this.handleSMSArray);
        },
        // 验证码翻页
        goVcodePage: function (pageNumber) {
            this.qryList('vcode',pageNumber,this.handleVcodePara,this.handleVcodeArray);
        },
        // 清除查询条件
        clearSearchConditions: function (paraName) {
            if ('request' == paraName) {
                this.merchantName = "";
                this.requestBeginDate = "";
                this.requestEndDate = "";
                return;
            }
            if ('sms' == paraName) {
                this.smsBeginDate = "";
                this.smsEndDate = "";
                return;
            }
            if ('vcode' == paraName) {
                this.vcodeBeginDate = "";
                this.vcodeEndDate = "";
                this.vcodeMobile = "";
                return;
            }
        },
        // 请求列表条件查询
        qryWithCondition: function (paraName) {
            if ('request' == paraName) {
                this.qryList('req', 1, this.handleReqPara, this.handleReqArray);
                return;
            }
            if ('sms' == paraName) {
                this.qryList('sms', 1, this.handleSMSPara, this.handleSMSArray);
                return;
            }

            if ('vcode' == paraName) {
                this.qryList('vcode', 1, this.handleVcodePara, this.handleVcodeArray);
                return;
            }
        },
        // 绑定进件明细的处理器
        handleReqPara: function (obParas) {
            if (this.requestBeginDate != "") {
                obParas.paraBeginDate = this.requestBeginDate;
            }
            if (this.requestEndDate != "") {
                obParas.paraEndDate = this.requestEndDate;
            }
        },
        // 处理进件数据的回显
        handleReqArray: function (rsdata) {
            if (rsdata.rs == "OK") {
                vInst.reqDataSet = rsdata.rsArray;
                vInst.totalCount = rsdata.total;
                return;
            }
        },
        // 绑定进件明细的处理器
        handleAminPara: function (obParas) {
            //NOOP
        },
        // 处理进件数据的回显
        handleAdminArray: function (rsdata) {
            if (rsdata.rs == "OK") {
                for (let p = 0; p < rsdata.rsArray.length; p++) {
                    if (rsdata.rsArray[p].is_root == 1) {
                        rsdata.rsArray[p].is_root = "是";
                    } else {
                        rsdata.rsArray[p].is_root = "否";
                    }
                    if (rsdata.rsArray[p].admin_status == 1) {
                        rsdata.rsArray[p].admin_status = "正常";
                    } else {
                        rsdata.rsArray[p].admin_status = "禁用";
                    }
                }
                vInst.merAdminDataSet = rsdata.rsArray;
                vInst.meradmTotalCount = rsdata.total;
                return;
            }
        },

        handleSMSPara: function (obParas) {
            if (this.smsBeginDate != "") {
                obParas.paraBeginDate = this.smsBeginDate;
            }
            if (this.smsEndDate != "") {
                obParas.paraEndDate = this.smsEndDate;
            }
        },

        handleSMSArray: function (rsdata) {
            if (rsdata.rs == "OK") {
                vInst.smsDataSet = rsdata.rsArray;
                vInst.smsTotalCount = rsdata.total;
                return;
            }
        },

        handleVcodePara: function (obParas) {
            if (this.vcodeBeginDate != "") {
                obParas.paraBeginDate = this.vcodeBeginDate;
            }
            if (this.vcodeEndDate != "") {
                obParas.paraEndDate = this.vcodeEndDate;
            }
            if (this.vcodeMobile != "") {
                obParas.paraMobile = this.vcodeMobile;
            }
        },

        handleVcodeArray: function (rsdata) {
            if (rsdata.rs == "OK") {
                console.log(rsdata.rsArray);
                vInst.vcodeDataSet = rsdata.rsArray;
                vInst.vcodeTotalCount = rsdata.total;
                return;
            }
        },

        qryList: function (funcName, pageNumber, paraBindHandler, arrayHandler) {
            let rand = new Date().getTime();
            let obParas = {
                limit: 10,
                offset: (pageNumber - 1) * 10,
                randstamp: rand
            };

            // 处理绑定参数
            paraBindHandler && paraBindHandler(obParas);

            // 构造请求URL
            let reqURL = 'admin/qry' + funcName + "list";

            // ajax请求发出并处理
            axios.get(reqURL, {
                params: obParas
            }).then(function (resp) {
                let rsdata = resp.data;
                if (rsdata.rs == "ERROR") {
                    alert("服务器内部错误");
                    return;
                }
                arrayHandler && arrayHandler(rsdata);
            }).catch(resp => {
                console.log('请求失败：' + resp.status + ',' + resp.statusText);
            });
        },

        goResetPwd: function () {
            let oldPwd = this.oldPwd;
            let newPwd = this.newPwd;
            let newPwdAffirm = this.newPwdAffirm;
            if (oldPwd == "" || oldPwd == "请输入原始密码") {
                alert("请输入原始密码名");
                return;
            }
            if (newPwd == "" || newPwd == "请输入新密码") {
                alert("请输入新密码");
                return;
            }
            if (newPwdAffirm == "" || newPwdAffirm == "请再次输入新密码") {
                alert("请再次输入新密码");
                return;
            }
            if (newPwd != newPwdAffirm) {
                alert("新密码两次输入不一致");
                return;
            }
            axios.post("admin/resetpwd", {
                oldPwd: oldPwd,
                newPwd: newPwd
            }).then(function (resp) {
                alert(resp.data.rs);
            }).catch(resp => {
                console.log('请求失败：' + resp.status + ',' + resp.statusText);
            });
        },

        // 启用/禁用
        changeAdminState: function (idx, row, nst) {
            let adminId = row.admin_id;
            let rand = new Date().getTime();
            let obParas = {
                adminId: adminId,
                nst: nst,
                randstamp: rand
            };
            axios.get("admin/changeadminstate", {
                params: obParas
            }).then(function (resp) {
                let rsdata = resp.data;
                if (rsdata.rs == "ERROR") {
                    alert(rsdata.text);
                    return [];
                }
                alert(rsdata.rs);
                vInst.goMerAdmPage(1);
            }).catch(resp => {
                console.log('请求失败：' + resp.status + ',' + resp.statusText);
            });
        },
        // 修改详细信息
        showModifyAdminDialog: function (idx, row) {
            console.log(row);
            this.beanAdmName = row.admin_name;
            this.beanAdmAcc = row.admin_acc;
            this.beanAdmMobile = row.admin_mobile;
            this.beanAdmPwd = row.admin_pwd;
            this.beanAdmStat = row.admin_status == "正常" ? true : false;
            this.dialogVisible = true;
            this.oper = "修改管理员";
            this.currentSelectedAdminId = row.admin_id;
        },
        // 取消增加管理员
        cancelAddAdmin: function () {
            this.dialogVisible = false;
            this.beanAdmName = "";
            this.beanAdmAcc = "";
            this.beanAdmMobile = "";
            this.beanAdmPwd = "";
            this.beanAdmStat = true;
        },
        beforeCancelAddAdmin: function (next) {
            this.beanAdmName = "";
            this.beanAdmAcc = "";
            this.beanAdmMobile = "";
            this.beanAdmPwd = "";
            this.beanAdmStat = true;
            next();
        },
        editAdmin: function () {
            if (this.oper == "修改管理员") {
                this.modifyAdmin();
            } else if (this.oper == "创建管理员") {
                this.addAdmin();
            }
        },
        // 增加管理员
        addAdmin: function () {
            let vName = vInst.beanAdmName
            let vAcc = vInst.beanAdmAcc;
            let vPwd = vInst.beanAdmPwd;
            let vMobile = vInst.beanAdmMobile;
            let vState = vInst.beanAdmStat;

            if (vName == "" || vName == "请输入管理员姓名") {
                alert("请输入管理员姓名");
                return;
            }
            if (vAcc == "" || vAcc == "请输入管理员账号") {
                alert("请输入管理员账号");
                return;
            }
            if (vPwd == "" || vPwd == "请输入管理员密码") {
                alert("请输入管理员密码");
                return;
            }

            //here we need a ajax req
            axios.post("admin/addadmin", {
                vname: vName,
                acc: vAcc,
                pwd: vPwd,
                mobile: vMobile,
                state: vState
            }
            ).then(function (resp) {
                console.log(resp.data);
                let rsdata = resp.data;
                if (rsdata.rs == "ERROR") {
                    alert(rsdata.text);
                    return;
                }
                if (rsdata.rs == "OK") {
                    alert("创建管理员成功");
                    vInst.cancelAddAdmin();
                    vInst.goMerAdmPage(1);
                    return;
                }
                alert("未知错误");
                return;
            }).catch(resp => {
                console.log('请求失败：' + resp.status + ',' + resp.statusText);
            });
        },
        // 修改管理员
        modifyAdmin: function () {
            let vName = vInst.beanAdmName
            let vAcc = vInst.beanAdmAcc;
            let vPwd = vInst.beanAdmPwd;
            let vMobile = vInst.beanAdmMobile;
            let vState = vInst.beanAdmStat;

            if (vName == "" || vName == "请输入管理员姓名") {
                alert("请输入管理员姓名");
                return;
            }
            if (vAcc == "" || vAcc == "请输入管理员账号") {
                alert("请输入管理员账号");
                return;
            }
            if (vPwd == "" || vPwd == "请输入管理员密码") {
                alert("请输入管理员密码");
                return;
            }

            //here we need a ajax req
            axios.post("admin/modadmin", {
                vname: vName,
                acc: vAcc,
                pwd: vPwd,
                mobile: vMobile,
                state: vState,
                adminid: vInst.currentSelectedAdminId
            }
            ).then(function (resp) {
                console.log(resp.data);
                let rsdata = resp.data;
                if (rsdata.rs == "ERROR") {
                    alert(rsdata.text);
                    return;
                }
                if (rsdata.rs == "OK") {
                    alert("修改管理员成功");
                    vInst.cancelAddAdmin();
                    vInst.goMerAdmPage(1);
                    return;
                }
                alert("未知错误");
                return;
            }).catch(resp => {
                console.log('请求失败：' + resp.status + ',' + resp.statusText);
            });
        },
        showAddAdminDialog: function () {
            this.oper = "创建管理员";
            this.dialogVisible = true;
        },
    }
});