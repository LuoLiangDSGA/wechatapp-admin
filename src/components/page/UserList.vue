<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 微信用户</el-breadcrumb-item>
                <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-input style="width: 280px;margin-bottom: 10px"
                  placeholder="昵称/年龄/城市"
                  icon="search"
                  v-model="searchCondition"
                  :on-icon-click="handleIconClick">
        </el-input>

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
                    <el-button size="small" type="danger"
                               @click="handleAdd(scope.$index, scope.row)">拉黑
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog title="提示" v-model="dialogVisible" size="tiny">
            <el-form>
                <el-form-item label="加入黑名单原因:" :label-width="formLabelWidth">
                    <el-select v-model="reason" placeholder="请选择原因">
                        <el-option label="恶语伤人" value="恶语伤人"></el-option>
                        <el-option label="造谣" value="造谣"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addBlackList">确 定</el-button>
          </span>
        </el-dialog>

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
                totalPage: 0,
                userPage: [],
                dialogVisible: false,
                formLabelWidth: '120px',
                reason: '',
                userId: 0,
                currentPage1: 1,
                searchCondition: ''
            }
        },
        created: function () {
            this.getData(1)
        },
        methods: {
            handleAdd(index, row) {
                this.dialogVisible = true;
                this.userId = row.id;
//                this.$message.error('删除第' + (index + 1) + '行');
            },
            getData(currentPage){
                request.get('http://localhost:8089/user/userlist')
                    .set("token", localStorage.getItem('token'))
                    .query({
                        currentPage: currentPage,
                        pageSize: 6,
                        searchCondition: this.searchCondition
                    }).end((err, res) => {
                    console.log(res);
                    if (!res.ok) {
                        if (res.status == 401) {
                            this.$notify.error('未登录用户，请登录后再使用');
                            this.$router.push('/login');
                        }
                    } else {
                        const result = JSON.parse(res.text).data;
                        if (result.length == 0) {
                            this.userPage = '';
                        } else {
                            this.userPage = result;
                            this.totalPage = Number(JSON.parse(res.text).resMsg.split("_")[0]);
                            this.currentPage = Number(JSON.parse(res.text).resMsg.split("_")[1]);
                        }
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
            addBlackList() {
                this.dialogVisible = false;
                if (this.reason != '') {
                    request.post('http://localhost:8089/blacklist/adduser')
                        .send({
                            userId: this.userId,
                            reason: this.reason
                        })
                        .set('Content-Type', 'application/x-www-form-urlencoded')
                        .end((err, res) => {
                            console.log(res);
                            let data = JSON.parse(res.text);
                            if (res.ok && data.code != 1) {
                                this.$notify.success("加入黑名单成功");
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            } else {
                                this.$notify.success(JSON.parse(res.text).resMsg);
                                console.log('加入黑名单失败');
                            }
                        });
                } else {
                    this.$message.error('请输入加入黑名单原因');
                }
            },
            handleIconClick(ev) {
                console.log("搜索关键词：" + this.searchCondition);
                this.getData(1);
            }
        }
    }
</script>
