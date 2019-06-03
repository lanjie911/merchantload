let vInst = null;

// 处理请求列表的数据
let handleReqQryResult = function (resp) {
    //console.log(resp.data);
    let rsdata = resp.data;
    if (rsdata.rs == "ERROR") {
        alert("服务器内部错误");
        return [];
    }
    if (rsdata.rs == "OK") {
        if (!rsdata.rsArray) {
            alert("没有查询到数据");
            return;
        }
        if (rsdata.rsArray.length == 0) {
            alert("没有查询到数据");
            return;
        }
        vInst.reqDataSet = rsdata.rsArray;
        vInst.totalCount = rsdata.total;
        return;
    }
    alert("未知错误");
    return [];
};

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

        //修改密码数据
        oldPwd: "",
        newPwd: "",
        newPwdAffirm: ""
    },
    created: function () {
        this.uiHeight = document.documentElement.clientHeight;
        console.info("body height is %s", this.uiHeight);
    },
    mounted: function () {
        console.log("mounted...refresh req list");
        this.qryRequestList(1);
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
        goPage: function (pageNumber) {
            //console.log(pageNumber);
            this.qryRequestList(pageNumber);
        },
        // 关闭标签
        tabRemoved: function (tabIdx) {
            console.log("tab index is %s", tabIdx);
            document.getElementById("tab-" + tabIdx).style.display = "none";
            document.getElementById("pane-" + tabIdx).style.display = "none";
        },
        clearSearchConditions: function () {
            this.merchantName = "";
            this.requestBeginDate = "";
            this.requestEndDate = "";
        },
        qryWithCondition: function () {
            this.qryRequestList(1);
        },
        qryRequestList: function (pageNumber) {
            let rand = new Date().getTime();
            let obParas = {
                limit: 10,
                offset: (pageNumber - 1) * 10,
                randstamp: rand
            };
            if (this.requestBeginDate != "") {
                obParas.paraBeginDate = this.requestBeginDate;
            }
            if (this.requestEndDate != "") {
                obParas.paraEndDate = this.requestEndDate;
            }
            axios.get("admin/qryreqlist", {
                params: obParas
            }).then(handleReqQryResult).catch(resp => {
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
        }
    }
});