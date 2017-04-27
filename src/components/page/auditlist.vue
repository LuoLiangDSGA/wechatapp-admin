<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 微信用户</el-breadcrumb-item>
                <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-table :data="activityPage" stripe style="width: 100%">
            <el-table-column prop="name" label="活动名称">
            </el-table-column>
            <el-table-column prop="startdate" label="开始时间" sortable>
            </el-table-column>
            <el-table-column prop="place" label="地点">
            </el-table-column>
            <el-table-column prop="sponsorName" label="发起人">
            </el-table-column>
            <el-table-column prop="introduction" label="介绍">
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
                    <el-button size="small" type="success"
                               @click="handlePass(scope.$index, scope.row)">通过
                    </el-button>
                    <br/>
                    <el-button size="small" type="danger" style="margin-top: 5px"
                               @click="handleRefuse(scope.$index, scope.row)">拒绝
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

        <el-dialog title="提示" v-model="passDialogVisible" size="tiny">
            <span>确认通过这个活动？</span>
            <span slot="footer" class="dialog-footer">
            <el-button @click="passDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="passActivity">确 定</el-button>
          </span>
        </el-dialog>

        <el-dialog title="提示" v-model="refuseDialogVisible" size="tiny">
            <el-form>
                <el-form-item label="拒绝原因:" :label-width="formLabelWidth">
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
                totalPage: 0,
                activityPage: [],
                tableData: [],
                passDialogVisible: false,
                refuseDialogVisible: false,
                reason: "",
                formLabelWidth: '120px',
                passId: 0,  //通过的活动id
                passUserId: 0,
                refuseUserId: 0,
                refuseId: 0   //拒绝通过的活动id
            }
        },
        created: function () {
            this.getData(1)
        },
        methods: {
            filterTag(value, row) {
                return row.label === value;
            },
            handlePass(index, row) {
                this.passDialogVisible = true;
                this.passId = row.id;
                this.passUserId = row.sponsorId;
//                this.$message('编辑第' + (index + 1) + '行');
            },
            handleRefuse(index, row) {
                this.refuseDialogVisible = true;
                this.refuseId = row.id;
                this.refuseUserId = row.sponsorId;
//                this.$message.error('删除第' + (index + 1) + '行');
            },
            getData(currentPage){
                request.get('http://localhost:8089/activity/seekact')
                    .query({currentPage: currentPage, pageSize: 6, hobbyNum: this.hobbyNum, isPass: 1})
                    .end((err, res) => {
                        console.log(res);
                        if (!res.ok) {
                        } else {
                            const result = JSON.parse(res.text).data;
                            if (result.length == 0) {
                            } else {
                                this.activityPage = result;
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
            passActivity() {
                this.passDialogVisible = false;
                console.log("要通过活动的id:" + this.passId + ",用户id:" + this.passUserId)
                request.post('http://localhost:8089/activity/passactivity')
                    .send({
                        passId: this.passId,
                        sponsorId: this.passUserId
                    })
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .end((err, res) => {
                        console.log(res);
                        let data = JSON.parse(res.text);
                        if (res.ok && data.code != 1) {
                            this.$notify.success("通过活动成功");
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            this.$notify.success(JSON.parse(res.text).resMsg);
                            console.log('通过活动失败');
                        }
                    });
            },
            refuseActivity() {
                this.refuseDialogVisible = false;
                if (this.reason != ''){
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
                                this.$notify.success("拒绝活动成功");
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            } else {
                                this.$notify.success(JSON.parse(res.text).resMsg);
                                console.log('拒绝活动失败');
                            }
                        });
                } else {
                    this.$message.error('请输入拒绝原因');
                }
            }
        }
    }
</script>
