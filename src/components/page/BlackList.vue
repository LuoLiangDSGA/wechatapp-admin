<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 微信用户</el-breadcrumb-item>
                <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-table :data="userPage" stripe style="width: 100%">
            <el-table-column prop="nickname" label="昵称">
            </el-table-column>
            <el-table-column prop="age" label="年龄" sortable>
            </el-table-column>
            <el-table-column prop="sex" label="性别">
            </el-table-column>
            <el-table-column prop="country" label="国家">
            </el-table-column>
            <el-table-column prop="province" label="省份">
            </el-table-column>
            <el-table-column prop="city" label="城市" width="120">
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" type="warning"
                               @click="handleRemove(scope.$index, scope.row)">移出黑名单
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-size="6"
                layout="total, prev, pager, next"
                :total="totalPage">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import request from 'superagent'

    export default {
        data() {
            return {
                currentPage: 1,
                hobbyNum: '',
                totalPage: 0,
                userPage: [],
                userId: 0,
                dialogVisible: false
            }
        },
        created: function () {
            this.getData(1)
        },
        methods: {
            handleRemove(index, row) {
//                this.$message('编辑第' + (index + 1) + '行');
                this.userId = row.id;
                this.removeBlackList();
            },
            getData(currentPage){
                request.get('http://localhost:8089/blacklist/userblacklist')
                    .set("token", localStorage.getItem('token'))
                    .query({currentPage: currentPage, pageSize: 6})
                    .end((err, res) => {
                        console.log(res);
                        if (!res.ok) {
                            if (res.status == 401) {
                                this.$notify.error('未登录用户，请登录后再使用');
                                this.$router.push('/login');
                            }
                        } else {
                            const result = JSON.parse(res.text).data;
//                            if (result.length == 0) {
//                            } else {
                            this.userPage = result;
                            this.totalPage = Number(JSON.parse(res.text).resMsg.split("_")[0]);
                            this.currentPage = Number(JSON.parse(res.text).resMsg.split("_")[1]);
//                            }
                        }
                    });
            },
            handleSizeChange(val) {
                console.log(`每页 ${val} 条`);
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                console.log(`当前页: ${val}`);
                this.getData(val)
            },
            removeBlackList() {
                request.post('http://localhost:8089/blacklist/removeuser')
                    .send({
                        userId: this.userId,
                    })
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .end((err, res) => {
                        console.log(res);
                        let data = JSON.parse(res.text);
                        if (res.ok && data.code != 1) {
                            this.$notify.success("移出黑名单成功");
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            this.$notify.success(JSON.parse(res.text).resMsg);
                            console.log('移出黑名单失败');
                        }
                    });
            }
        }
    }
</script>
