<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 微信用户</el-breadcrumb-item>
                <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-input style="width: 280px;margin-bottom: 10px"
                  placeholder="活动名称/发起人/地点"
                  icon="search"
                  v-model="searchCondition"
                  :on-icon-click="handleIconClick">
        </el-input>

        <el-table :data="activityPage" stripe style="width: 100%">
            <el-table-column prop="name" label="活动名称">
            </el-table-column>
            <el-table-column prop="startdate" label="开始时间" sortable width="150">
            </el-table-column>
            <el-table-column prop="place" label="地点">
            </el-table-column>
            <el-table-column prop="sponsorName" label="发起人">
            </el-table-column>
            <el-table-column prop="label" label="类型"
                             :filters="[{ text: '交友聚会', value: '交友聚会' },
                             { text: '音乐戏剧', value: '音乐戏剧' },
                             { text: '体育运动', value: '体育运动' },
                             { text: '户外旅行', value: '户外旅行' },
                             { text: '讲座公益', value: '讲座公益' },
                             { text: '其他', value: '其他' }]"
                             :filter-method="filterTag">
                <template scope="scope">
                    <el-tag :type="scope.row.label === '交友聚会' ? 'primary' : 'success'">
                        {{scope.row.label}}

                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" type="info"
                               @click="handleEdit(scope.$index, scope.row)">查看
                    </el-button>
                    <el-button size="small" type="danger"
                               @click="handleDelete(scope.$index, scope.row)">中止
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

        <el-dialog title="活动详情" v-model="dialogFormVisible" size="tiny">
            <el-form :model="form">
                <el-form-item label="活动名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="活动时间" :label-width="formLabelWidth">
                    <el-input v-model="form.startdate" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="活动人数" :label-width="formLabelWidth">
                    <el-input v-model="form.personNum" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="活动地点" :label-width="formLabelWidth">
                    <el-input v-model="form.place" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="活动预算" :label-width="formLabelWidth">
                    <el-input v-model="form.budget" auto-complete="off" disabled></el-input>
                </el-form-item>
                <el-form-item label="活动介绍" :label-width="formLabelWidth">
                    <el-input type="textarea" v-model="form.introduction" auto-complete="off" disabled></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <!--<el-button @click="dialogFormVisible = false">取 消</el-button>-->
                <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="提示" v-model="refuseDialogVisible" size="tiny">
            <el-form>
                <el-form-item label="中止原因:" :label-width="formLabelWidth">
                    <el-select v-model="reason" placeholder="请选择原因">
                        <el-option label="名字不合格" value="名字不合格"></el-option>
                        <el-option label="介绍不合格" value="介绍不合格"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="refuseDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="refuseActivity">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
    import request from 'superagent'

    export default {
        data() {
            return {
                currentPage: 1,
                hobbyNum: '',
                searchCondition: '',
                totalPage: 0,
                activityPage: [],
                tableData: [],
                reason: '',
                refuseDialogVisible: false,
                dialogFormVisible: false,
                refuseUserId: 0,
                refuseId: 0,   //拒绝通过的活动id
                form: {
                    name: '',
                    startdate: '',
                    personNum: '',
                    place: '',
                    budget: '',
                    introduction: ''
                },
                formLabelWidth: '80px'
            }
        },
        created: function () {
            this.getData(1)
        },
        methods: {
            filterTag(value, row) {
                return row.label === value;
            },
            handleEdit(index, row) {
                //this.$message('编辑第' + (index + 1) + '行');
                this.dialogFormVisible = true
                this.getActivityDetail(row.id);
            },
            handleDelete(index, row) {
                this.refuseDialogVisible = true;
                this.refuseId = row.id;
                this.refuseUserId = row.sponsorId;
                //this.$message.error('删除第' + (row.id) + '行');
            },
            getData(currentPage){
                request.get('http://localhost:8089/activity/activityList')
                    .set("token", localStorage.getItem('token'))
                    .query({
                        currentPage: currentPage,
                        pageSize: 6,
                        hobbyNum: this.hobbyNum,
                        isPass: 0,
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
                            this.activityPage = '';
                        } else {
                            this.activityPage = result;
                            this.totalPage = parseInt(JSON.parse(res.text).resMsg.split("_")[0]);
                            this.currentPage = parseInt(JSON.parse(res.text).resMsg.split("_")[1]);
                        }
                    }
                });
            },
            getActivityDetail(actId) {
                request.get('http://localhost:8089/activity/activitydetail')
                    .query({actId: actId})
                    .end((err, res) => {
                        console.log(res);
                        if (res.ok) {
                            let result = JSON.parse(res.text).data;
                            this.form = JSON.parse(res.text).data;
                            this.form.startdate = result.startDate.split(' ')[0];
                            this.form.personNum = result.personNum + ' / '
                                + result.totalPersonNum
                        } else {
                            console.log('请求数据失败');
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
            refuseActivity() {
                this.refuseDialogVisible = false;
                if (this.reason != '') {
                    request.post('http://localhost:8089/activity/refuseActivity')
                        .send({
                            passId: this.refuseId,
                            sponsorId: this.refuseUserId,
                            reason: this.reason
                        })
                        .set('Content-Type', 'application/x-www-form-urlencoded')
                        .end((err, res) => {
                            console.log(res);
                            let data = JSON.parse(res.text);
                            if (res.ok && data.code != 1) {
                                this.$notify.success("中止活动成功");
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            } else {
                                this.$notify.success(JSON.parse(res.text).resMsg);
                                console.log('中止活动失败');
                            }
                        });
                } else {
                    this.$message.error('请输入中止原因');
                }
            },
            handleIconClick(ev) {
                console.log("搜索关键词：" + this.searchCondition);
                this.getData(1);
            }
        }
    }
</script>
