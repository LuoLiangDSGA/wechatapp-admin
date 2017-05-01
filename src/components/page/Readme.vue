<template>
    <div class="allActive">
        <el-row class="head">
            <el-col :span="18" style="padding:20px 0;background: #33CCCC;">
                <el-col :span="8">
                    {{ activityNumber }}<br>
                    <span>活动总数</span>
                </el-col>
                <el-col :span="8">
                    {{ applyNumber }}<br>
                    <span>报名总数</span>
                </el-col>
                <el-col :span="8" style="border: none;">
                    {{ auditActivityNumber }}<br>
                    <span>待审核</span>
                </el-col>
            </el-col>

            <el-col :span="5" :offset="1" style="background:  #778899;padding:40px 0;">
                {{ blacklistNumber }}<br>
                <span>黑名单</span>
            </el-col>
        </el-row>


        <div class="echarts">
            <IEcharts :option="line"></IEcharts>
        </div>
        <div class="echarts">
            <IEcharts :option="pie"></IEcharts>
        </div>

    </div>
</template>
<script>
    import IEcharts from 'vue-echarts-v3';
    import request from 'superagent'

    export default {
        name: 'allActive',
        components: {
            IEcharts
        },
        data: function () {
            return {
                activityNumber: 3,
                applyNumber: 204,
                auditActivityNumber: 15,
                blacklistNumber: 0,
                tableData: [],
                pieData: [],
                pieDataValue: [],
                line: {
                    color: ["#20a0ff", "#13CE66", "#F7BA2A", "#FF4949"],
                    title: {
                        text: ''
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    legend: {
                        data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            boundaryGap: false,
                            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: []
                },
                pie: {
                    color: ["#20a0ff", "#13CE66", "#F7BA2A", "#FF4949", "#61a0a8", "#33CCCC"],
                    title: {
                        text: '活动类型',
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: []
                    },
                    series: [
                        {
                            name: '类型',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '50%'],
                            data: [],
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                }
            }
        },
        computed: {},
        methods: {
            getData () {
                request.get('http://localhost:8089/activity/admininfo')
                    .set("token", localStorage.getItem('token'))
                    .end((err, res) => {
                        console.log(res);
                        if (!res.ok) {
                            if (res.status == 401) {
                                this.$notify.error('未登录用户，请登录后再使用');
                                this.$router.push('/login');
                            }
                        } else {
                            const result = JSON.parse(res.text).data;
                            this.activityNumber = result.activityNumber;
                            this.applyNumber = result.applyNumber;
                            this.auditActivityNumber = result.auditActivityNumber;
                            this.blacklistNumber = result.blacklistNumber;
                            this.pieDataValue = result.pieData;
                            this.pieData = [];
                            for (let obj of this.pieDataValue) {
                                this.pieData.push(obj.name)
                            }
                            this.pie.series[0].data = this.pieDataValue;
                            this.pie.legend.data = this.pieData;
                            let data = [];
                            for (let obj of result.lineData) {
                                obj.areaStyle = {normal: {}};
                                data.push(obj)
                            }
                            this.line.series = data;
                            data = [];
                            for (let obj of result.lineData) {
                                data.push(obj.name)
                            }
                            this.line.legend.data = data;
                        }
                    });
            }
        },
        created: function () {
            this.getData();
        }
    }
</script>
<style>
    .allActive > .head > .el-col > .el-col {
        padding: 20px 0;
        border-right: solid 1px #fff;
    }

    .allActive .head {
        text-align: center;
        color: #fff;
        font-size: 30px;
        margin-bottom: 50px;
    }

    .allActive .head span {
        font-size: 16px;
    }

    .echarts {
        float: left;
        width: 500px;
        height: 400px;
    }
</style>
