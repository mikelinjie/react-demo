var Router = ReactRouter; // 由于是html直接引用的库，所以 ReactRouter 是以全局变量的形式挂在 window 上
var Route = ReactRouter.Route; 
var RouteHandler = ReactRouter.RouteHandler;
var Link = ReactRouter.Link;
var StateMixin = ReactRouter.State;
var browserHistory = ReactRouter.browserHistory

var pubsub_token;
var globalChart;
// 时间格式化
Date.prototype.format = function(fmt)   
{ // author: meizz
  var o = {   
    "M+" : this.getMonth()+1,                 // 月份
    "d+" : this.getDate(),                    // 日
    "h+" : this.getHours(),                   // 小时
    "m+" : this.getMinutes(),                 // 分
    "s+" : this.getSeconds(),                 // 秒
    "q+" : Math.floor((this.getMonth()+3)/3), // 季度
    "S"  : this.getMilliseconds()             // 毫秒
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}  

// 一天毫秒数 86400000

var data_search=function(day){
	if(day){
		var period=day*86400000;
		$("#inpstart").val(new Date(new Date().getTime()-period).format("yyyy-MM-dd"));
		$("#inpend").val(new Date(new Date().getTime()-86400000).format("yyyy-MM-dd"));
	}
	var t=$("#inpstart").val()+','+$("#inpend").val();
	if(t.length<12) return;

	PubSub.publish('search',t);
	console.log('Search事件');
}

// 功能分析，图表支持
var func_item='nceApps';// 图表的初始值

$(function(){
	var timer;

	   laydate({
           elem: '#inpstart'
       });
	   laydate({
           elem: '#inpend'
       });
		$("#inpstart").val(new Date(new Date().getTime()-864000000).format("yyyy-MM-dd"));
		$("#inpend").val(new Date(new Date().getTime()-86400000).format("yyyy-MM-dd"));
// // --------search
// $("#search").click(function(){
// var t=$("#inpstart").val()+','+$("#inpend").val();
// if(t.length<12) return;
//	
// pubsub.publish('search',null,t);
// console.log('Search事件');
// });
	

	
var Overviewtable = React.createClass({
	  getInitialState: function() {

	    return {
	    	data: {},
	    };
	  },
	  
	  getRealtimeData:function(){
		  $.ajax({ url:'../data/overview/realnceapp', 
			  datatype:'json',
			  type:'POST',
			  async: false,
			  success:function(rdata){
				  var realtimeData=rdata.map(function(d) {
					return {
						name:d.date,
						value:[
						   new Date(d.date),
						   d.nceApp
						]
					}
				  });
					var  option = {
						    title: {
						        text: '蜂巢容器实时数量'
						    },
						    tooltip: {
						        trigger: 'axis',
						        formatter: function (params) {
						            params = params[0];
						            var date = new Date(params.name);
						            return date.format("yyyy-MM-dd hh:mm:ss") +' : ' + params.value[1];
						        },
						        axisPointer: {
						            animation: false
						        }
						    },
						    xAxis: {
						        type: 'time',
						        splitLine: {
						            show: true
						        }
						    },
						    yAxis: {
						        type: 'value',
						        boundaryGap: [0, '100%'],
						        min:10200,
						        splitLine: {
						            show: true
						        }
						    },
						    series: [{
						        name: '模拟数据',
						        type: 'line',
						        showSymbol: false,
						        hoverAnimation: false,
						        data: realtimeData,
						    }]
						};
					globalChart.setOption(option);
			  }.bind(this),
			  error:function(){}
		  });
	

	  },
	  componentDidMount: function() {
		  $(".search_div").hide();
		  PubSub.publish('datatitle','数据总览' );
		  this.loadDataCountFromServer();
		  this.setState({
				realtimeData:[], 
		  });
			  globalChart = echarts.init(document.getElementById('graph3'));
		  this.getRealtimeData();
		  timer=setInterval(this.getRealtimeData,120000);

	  },
	 
	  componentWillUnmount: function () {
		  console.log("组件开始被卸载--------------------");
		  window.clearInterval(timer)
	  },
	  loadDataCountFromServer: function(){
		  console.log('loadDataCountFromServer-----------');
		  console.log(this.state.timeStart+','+this.state.timeEnd);
		  $.ajax({ url:'../data/overview', 
			  datatype:'json',
			  type:'POST',
			  success:function(rdata){ 
				  this.setState({
			  	        data:JSON.parse(rdata)
			  	      });
				  console.log(this.state.data);
			  }.bind(this),
			  error:function(){}
		  });
		 
	  },
	 render: function() {
	   return (<div>
		 		<div id="graph3" className="graph1"></div>
		 			<hr /> 
				   <table className="table">
						<thead>
							<tr>
								<th></th>
								<th>新增人数</th>
								<th>用户总数</th>
								<th>新增充值金额</th>
								<th>累计充值金额</th>
								<th>容器</th>
								<th>集群</th>
								<th>数据库</th>
								<th>缓存</th>
							</tr>
						</thead>
						<tbody>
						<tr>
							<th>今日</th>
							<td>{this.state.data.t_newusers}</td>
							<td>{this.state.data.t_allusers}</td>
							<td>{this.state.data.t_rechargemoney}</td>
							<td>{this.state.data.t_allmoney}</td>
							<td>{this.state.data.t_nceapp}</td>
							<td>{this.state.data.t_nseapp}</td>
							<td>{this.state.data.t_rdsapp}</td>
							<td>{this.state.data.t_ncrapp}</td>
						</tr>
						<tr>
							<th>昨日</th>
							<td>{this.state.data.y_newusers}</td>
							<td>{this.state.data.y_allusers}</td>
							<td>{this.state.data.y_rechargemoney}</td>
							<td>{this.state.data.y_allmoney}</td>
							<td>{this.state.data.y_nceapp}</td>
							<td>{this.state.data.y_nseapp}</td>
							<td>{this.state.data.y_rdsapp}</td>
							<td>{this.state.data.y_ncrapp}</td>
						</tr>
						</tbody>
					</table>
				
				</div>
				)
	 },

	})	
	
	
	
var Usertable = React.createClass({

	  getInitialState: function() {

	    return {
	    	data: {},
	    	timeStart:new Date(new Date().getTime()-864000000).format("yyyy-MM-dd"),
	    	timeEnd:new Date(new Date().getTime()-86400000).format("yyyy-MM-dd")
	    };
	  },
		
	  componentDidMount: function() {
		  
		  PubSub.publish('datatitle','用户分析' );
		pubsub_token = PubSub.subscribe('search', function (context, time) {
			var t=time.split(',');
				this.setState({
	  	        timeStart: t[0],
	  	        timeEnd:t[1]
	  	      });
			  
			console.log("收到消息------"+time);
		    this.loadDataCountFromServer();
		    }.bind(this));
	    this.loadDataCountFromServer();
	    $(".search_div").show();
	  },
	  componentWillUnmount: function () {
		  console.log("组件开始被卸载--------------------");
		  PubSub.unsubscribe('search');
	  },
	  loadDataCountFromServer: function(){
		  console.log('loadDataCountFromServer-----------');
		  console.log(this.state.timeStart+','+this.state.timeEnd);
		  $.ajax({ url:'../data/user', 
			  datatype:'json',
			  type:'POST',
			  data:{"timeStart":this.state.timeStart,"timeEnd":this.state.timeEnd},
			  success:function(rdata){
				  this.setState({
			  	        data:rdata
			  	      });
				  console.log(this.state.data);
				  var realtimeData=rdata.map(function(d) {
						return {
							name:d.date,
							value:[
							   new Date(d.date),
							   d.rechargeUsers
							]
						}
					  });
						var  option = {
							    title: {
							        text: '充值用户人数'
							    },
							    tooltip: {
							        trigger: 'axis',
							        formatter: function (params) {
							            params = params[0];
							            var date = new Date(params.name);
							            return date.format("yyyy-MM-dd hh:mm:ss") +' : ' + params.value[1];
							        },
							        axisPointer: {
							            animation: false
							        }
							    },
							    xAxis: {
							        type: 'time',
							        splitLine: {
							            show: true
							        }
							    },
							    yAxis: {
							        type: 'value',
							        boundaryGap: [0, '100%'],
							        min:0,
							        splitLine: {
							            show: true
							        }
							    },
							    series: [{
							        name: '模拟数据',
							        type: 'line',
							        showSymbol: false,
							        hoverAnimation: false,
							        data: realtimeData,
							    }]
							};
						globalChart = echarts.init(document.getElementById('graph3'));
						globalChart.setOption(option);
				  
				  
			  }.bind(this),
			  error:function(){}
		  });
		 
	  },
	 render: function() {
			if(!(this.state.data instanceof Array))
				return (<div>加载中......</div>);
			var nodes=this.state.data.map(function(node){
				return(
						<tr>
							<td>{new Date(node.date).format("yyyy-MM-dd")}</td>
							<td>{node.newUsers}</td>
							<td>{node.rechargeUsers}</td>
							<td>{node.consumeUsers}</td>
						</tr>	
					);
				}); 
		 
	   return (
			<div>
			 <div id="graph3" className="graph1"></div>
			 <hr/> 
			  <table className="table">
		
				<thead>
					<tr>
						<th>时间</th>
						<th>新增人数</th>
						<th>充值人数</th>
						<th title="产生消费的用户数量">活跃用户数</th>
					</tr>
				</thead>
				<tbody>
					{nodes}
				</tbody>
			 </table>
			
		   </div>
	   );
	 },


});	
	

var Financetable = React.createClass({
	  getInitialState: function() {
		    return {
		    	data: {},
		    	timeStart:new Date(new Date().getTime()-864000000).format("yyyy-MM-dd"),
		    	timeEnd:new Date(new Date().getTime()-86400000).format("yyyy-MM-dd")
		    };
	  },
	  
	  componentDidMount: function() {
		  
		  PubSub.publish('datatitle','金额分析' );
		pubsub_token = PubSub.subscribe('search', function (context, time) {
			var t=time.split(',');
				this.setState({
	  	        timeStart: t[0],
	  	        timeEnd:t[1]
	  	      });
			  
			console.log("收到消息------"+time);
		    this.loadDataCountFromServer();
		    }.bind(this));
	    this.loadDataCountFromServer();
	    $(".search_div").show();
	  },
	  componentWillUnmount: function () {
		  console.log("组件开始被卸载--------------------");
		  PubSub.unsubscribe('search');
	  },
	  loadDataCountFromServer: function(){
		  console.log('loadDataCountFromServer-----------');
		  console.log(this.state.timeStart+','+this.state.timeEnd);
		  $.ajax({ url:'../data/finance/list', 
			  datatype:'json',
			  type:'POST',
			  data:{"timeStart":this.state.timeStart,"timeEnd":this.state.timeEnd},
			  success:function(rdata){
				  this.setState({
			  	        data:rdata
			  	      });
				  console.log(this.state.data);
				  var realtimeData=rdata.map(function(d) {
						return {
							name:d.date,
							value:[
							   new Date(d.date),
							   d.rechargeMoney
							]
						}
					  });
						var  option = {
							    title: {
							        text: '用户日充值金额'
							    },
							    tooltip: {
							        trigger: 'axis',
							        formatter: function (params) {
							            params = params[0];
							            var date = new Date(params.name);
							            return date.format("yyyy-MM-dd hh:mm:ss") +' : ' + params.value[1];
							        },
							        axisPointer: {
							            animation: false
							        }
							    },
							    xAxis: {
							        type: 'time',
							        splitLine: {
							            show: true
							        }
							    },
							    yAxis: {
							        type: 'value',
							        boundaryGap: [0, '100%'],
							        min:0,
							        splitLine: {
							            show: true
							        }
							    },
							    series: [{
							        name: '模拟数据',
							        type: 'line',
							        showSymbol: false,
							        hoverAnimation: false,
							        data: realtimeData,
							    }]
							};
						globalChart = echarts.init(document.getElementById('graph3'));
						globalChart.setOption(option);
			  }.bind(this),
			  error:function(){}
		  });
		  
		  $.ajax({ url:'../data/finance/overview', 
			  datatype:'json',
			  type:'POST',
			  success:function(rdata){
				  this.setState({
					  overview:JSON.parse(rdata)
		  	      	});
				  console.log(this.state.overview);
			  }.bind(this),
			  error:function(){}
		  });
		 
	  },
	 render: function() {
			if(!(this.state.data instanceof Array))
				return (<div>加载中......</div>);
			var nodes=this.state.data.map(function(node){
				return(
						<tr>
							<td>{new Date(node.date).format("yyyy-MM-dd")}</td>
							<td>{node.rechargeUsers}</td>
							<td>{node.rechargeTimes}</td>
							<td>{node.rechargeMoney}</td>
							<td>{node.consumeRechargeMoney}</td>
							<td>{node.distributedVoucherUsers}</td>
							<td>{node.distributedVoucherTimes}</td>
							<td>{node.distributedVoucherMoney}</td>
							<td>{node.consumeVoucherMoney}</td>
							<td>{(node.consumeVoucherMoney+node.consumeRechargeMoney).toFixed(3)}</td>
						</tr>	
					);
				}); 
			return (<div>
			   			<div id="graph3" className="graph1"></div>
			   			<hr/> 
					   <table className="table">
				
						<thead>
							<tr>
								<th>代金卷发放总用户</th>
								<th>代金卷发放总次数</th>
								<th>代金卷发放总金额</th>
								<th title="收到代金卷后还愿意充值的用户">回流用户</th>
								<th>回流用户消费金额</th>
							
							</tr>
						</thead>
						<tbody>
							<td>{this.state.overview.a_voucherUsers}</td>
							<td>{this.state.overview.a_voucherTimes}</td>
							<td>{this.state.overview.a_voucherMoney}</td>
							<td>{this.state.overview.a_rebackUsers}</td>
							<td>{this.state.overview.a_rebackMoney}</td>
						</tbody>
					</table>
					   <table className="table">
						
						<thead>
							<tr>
								<th>时间</th>
								<th>充值人数</th>
								<th>充值次数</th>
								<th>充值金额</th>
								<th>消费真实金额</th>
								<th>发放代金卷人数</th>
								<th>发放代金卷次数</th>
								<th>发放代金卷金额</th>
								<th>消费代金卷金额</th>
								<th title="消费总额=消费真实金额+消费代金卷金额">消费总额</th>
							</tr>
						</thead>
						<tbody>
							{nodes}
						</tbody>
					</table>
					
					</div>
			   );
	 },

})


	var  func_option = {
	    title: {
	        text: '日创建容器数'
	    },
	    tooltip: {
	        trigger: 'axis',
	        formatter: function (params) {
	            params = params[0];
	            var date = new Date(params.name);
	            return date.format("yyyy-MM-dd hh:mm:ss") +' : ' + params.value[1];
	        },
	        axisPointer: {
	            animation: false
	        }
	    },
	    xAxis: {
	        type: 'time',
	        splitLine: {
	            show: true
	        }
	    },
	    yAxis: {
	        type: 'value',
	        boundaryGap: [0, '100%'],
	        min:0,
	        splitLine: {
	            show: true
	        }
	    },
	    series: [{
	        name: '模拟数据',
	        type: 'line',
	        showSymbol: false,
	        hoverAnimation: false,
	        data: [],
	    }]
	};


var Functiontable = React.createClass({
  getInitialState: function() {

    return {
    	data: {},
    	timeStart:new Date(new Date().getTime()-864000000).format("yyyy-MM-dd"),
    	timeEnd:new Date(new Date().getTime()-86400000).format("yyyy-MM-dd")
    };
  },
	
  componentDidMount: function() {
	 
	  PubSub.publish('datatitle','功能分析' );
	pubsub_token = PubSub.subscribe('search', function (context, time) {
		var t=time.split(',');
			this.setState({
  	        timeStart: t[0],
  	        timeEnd:t[1]
  	      });
		  
		console.log("收到消息------"+time);
	    this.loadDataCountFromServer(func_item);
	    }.bind(this));
    this.loadDataCountFromServer(func_item);
    $(".search_div").show();
  },
  componentWillUnmount: function () {
	  console.log("组件开始被卸载--------------------");
	  PubSub.unsubscribe('search');
  },
  loadDataCountFromServer: function(item){
	  console.log('loadDataCountFromServer-----------');
	  console.log(this.state.timeStart+','+this.state.timeEnd);
	  $.ajax({ url:'../data/function', 
		  datatype:'json',
		  type:'POST',
		  data:{"timeStart":this.state.timeStart,"timeEnd":this.state.timeEnd},
		  success:function(rdata){
			  this.setState({
		  	        data:rdata
		  	      });
			  
			  this.setECharts(item);
			 
		  }.bind(this),
		  error:function(){}
	  });
  },
  
  setECharts:function(item){
	  func_item=item;
	  var realtimeData;
	  var rdata=this.state.data;
	  switch (item) {
		case 'nceUsers':
			func_option.title.text='NCE消费人数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nceUsers
					]
				}
			  });
			break;
		case 'nceApps':
			func_option.title.text='NCE产生消费的实例数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nceApps
					]
				}
			  });
			break;
		case 'nceMoney':
			func_option.title.text='NCE消费金额';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nceMoney
					]
				}
			  });
			break;
		case 'nseUsers':
			func_option.title.text='NSE消费人数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nseUsers
					]
				}
			  });
			break;
		case 'nseApps':
			func_option.title.text='NSE产生消费的实例数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nseApps
					]
				}
			  });
			break;
		case 'nseMoney':
			func_option.title.text='NSE消费金额';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nseMoney
					]
				}
			  });
			break;
		case 'rdsUsers':
			func_option.title.text='RDS消费人数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.rdsUsers
					]
				}
			  });
			break;
		case 'rdsApps':
			func_option.title.text='RDS产生消费的实例数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.rdsApps
					]
				}
			  });
			break;
		case 'rdsMoney':
			func_option.title.text='RDS消费金额';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.rdsMoney
					]
				}
			  });	
			break;
		case 'ncrUsers':
			func_option.title.text='NCR消费人数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.ncrUsers
					]
				}
			  });
			break;
		case 'ncrApps':
			func_option.title.text='NCR产生消费的实例数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.ncrApps
					]
				}
			  });
			break;
		case 'ncrMoney':
			func_option.title.text='NCR消费金额';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.ncrMoney
					]
				}
			  });
			break;
		case 'nlbUsers':
			func_option.title.text='NLB消费人数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nlbUsers
					]
				}
			  });
			break;
		case 'nlbApps':
			func_option.title.text='NLB产生消费的实例数';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nlbApps
					]
				}
			  });
			break;
		case 'nlbMoney':
			func_option.title.text='NLB消费金额';
			realtimeData=rdata.map(function(d) {
				return {
					name:d.date,
					value:[
					   new Date(d.date),
					   d.nlbMoney
					]
				}
			  });
			break;


		default:
			break;
		}
	  

	  func_option.series[0].data=realtimeData;
	  globalChart = echarts.init(document.getElementById('graph3'));
	  globalChart.setOption(func_option);
	  $(".functionTitle").css("background-color","#FFF");
	  $("."+item).css({"background-color":"#CBE7FF"});
	  
  },
  handleClick:function(item,e){
	  $(".functionTitle").css("background-color","#FFF");
	  $("."+item).css({"background-color":"#CBE7FF"});
	  this.setECharts(item);
  },
 render: function() {
		if(!(this.state.data instanceof Array))
			return (<div>加载中......</div>);
		var nodes=this.state.data.map(function(node){
			return(
					<tr>
						<td>{new Date(node.date).format("yyyy-MM-dd")}</td>
						<td className='functionTitle nceUsers'>{node.nceUsers}</td>
						<td className='functionTitle nceApps'>{node.nceApps}</td>
						<td className='functionTitle nceMoney'>{node.nceMoney}</td>
						<td className='functionTitle nseUsers'>{node.nseUsers}</td>
						<td className='functionTitle nseApps'>{node.nseApps}</td>
						<td className='functionTitle nseMoney'>{node.nseMoney}</td>
						<td className='functionTitle rdsUsers'>{node.rdsUsers}</td>
						<td className='functionTitle rdsApps'>{node.rdsApps}</td>
						<td className='functionTitle rdsMoney'>{node.rdsMoney}</td>
						<td className='functionTitle ncrUsers'>{node.ncrUsers}</td>
						<td className='functionTitle ncrApps'>{node.ncrApps}</td>
						<td className='functionTitle ncrMoney'>{node.ncrMoney}</td>
						<td className='functionTitle nlbUsers'>{node.nlbUsers}</td>
						<td className='functionTitle nlbApps'>{node.nlbApps}</td>
						<td className='functionTitle nlbMoney'>{node.nlbMoney}</td>
					</tr>	
				);
			}); 
	 
   return (
		   <div>
			 <div id="graph3" className="graph1"></div>
			 <hr/> 
		   <table className="table">
			<thead>
				<tr>
					<th>时间</th>
					<th className='functionTitle nceUsers' onClick={this.handleClick.bind(this,'nceUsers')} title="容器人数">NCE人数</th>
					<th className='functionTitle nceApps' onClick={this.handleClick.bind(this,'nceApps')} title="产生消费的容器实例数">NCE实例数</th>
					<th className='functionTitle nceMoney' onClick={this.handleClick.bind(this,'nceMoney')} title="容器消费额">NCE消费额</th>
					<th className='functionTitle nseUsers' onClick={this.handleClick.bind(this,'nseUsers')} title="集群人数">NSE人数</th>
					<th className='functionTitle nseApps' onClick={this.handleClick.bind(this,'nseApps')} title="产生消费的集群实例数">NSE实例数</th>
					<th className='functionTitle nseMoney' onClick={this.handleClick.bind(this,'nseMoney')} title="集群消费额">NSE消费额</th>
					<th className='functionTitle rdsUsers' onClick={this.handleClick.bind(this,'rdsUsers')} title="数据库人数">RDS人数</th>
					<th className='functionTitle rdsApps' onClick={this.handleClick.bind(this,'rdsApps')} title="产生消费的数据库实例数">RDS实例数</th>
					<th className='functionTitle rdsMoney' onClick={this.handleClick.bind(this,'rdsMoney')} title="数据库消费额">RDS消费额</th>
					<th className='functionTitle ncrUsers' onClick={this.handleClick.bind(this,'ncrUsers')} title="缓存人数">NCR人数</th>
					<th className='functionTitle ncrApps' onClick={this.handleClick.bind(this,'ncrApps')} title="产生消费的缓存实例数">NCR实例数</th>
					<th className='functionTitle ncrMoney' onClick={this.handleClick.bind(this,'ncrMoney')} title="缓存消费额">NCR消费金额</th>
					<th className='functionTitle nlbUsers' onClick={this.handleClick.bind(this,'nlbUsers')} title="负载均衡人数">NLB人数</th>
					<th className='functionTitle nlbApps' onClick={this.handleClick.bind(this,'nlbApps')} title="产生消费的负载均衡实例数">NLB实例数</th>
					<th className='functionTitle nlbMoney' onClick={this.handleClick.bind(this,'nlbMoney')} title="负载均衡消费额">NLB消费额</th>
				</tr>
			</thead>
			<tbody>
				{nodes}
			</tbody>
		</table>
	
		</div>
   );
 },

});


var Othergraph = React.createClass({
	  getInitialState: function() {
	    return {data: []};
	  },

	  componentDidMount: function() {
		  $(".search_div").hide();
		  PubSub.publish('datatitle','其他分析' );
	    this.loadDataCountFromServer();
	  },

	 render: function() {
	   return (
	 <div>
	     <div id="graph1" className="graph">加载中。。。 </div>
	     <div id="graph2" className="graph">加载中。。。 </div>
	 </div>
	   );
	 },
	  loadDataCountFromServer: function(){
	    $.ajax({
	        url:'../data/otherg1',
	        datatype:'json',
	        type:'POST',
	        success:function(data){
	        	console.log(data);
	        	var d=JSON.parse(data);
	        	var myChart1 = echarts.init(document.getElementById('graph1'));
	        	myChart1.setOption(d);
	        // window.myChart1=myChart1;
	        	
	        }.bind(this),
	        error:function(xhr,status,err){
	           console.error(this.props.url, status, err.toString());
	        }.bind(this)
	    });
	    
	    $.ajax({
	        url:'../data/otherg2',
	        datatype:'json',
	        type:'POST',
	        success:function(data){
	        	console.log(data);
	        	var d=JSON.parse(data);
	        	var myChart2 = echarts.init(document.getElementById('graph2'));
	        	myChart2.setOption(d);
	        // window.myChart2=myChart2;
	        	
	        }.bind(this),
	        error:function(xhr,status,err){
	           console.error(this.props.url, status, err.toString());
	        }.bind(this)
	    });
	  },
	})


var Datanavcat = React.createClass({
	 handleClick(itemhash) {
		 	console.log(itemhash);
	        window.location.hash = itemhash; // 被点击元素的‘key’的值‘about’就是页面跳转的路径
// switch(itemhash)
// {
// case 'overview':
// pubsub.publish('datatitle',null,'数据总览' )
// break;
// case 'userAnalysis':
// pubsub.publish('datatitle',null, '用户分析')
// break;
// case 'financeAnalysis':
// pubsub.publish('datatitle',null, '金额分析')
// break;
// case 'functionAnalysis':
// pubsub.publish('datatitle',null, '功能分析')
// break;
// case 'otherAnalysis':
// pubsub.publish('datatitle',null, '其他指标')
// break;
// default:
// pubsub.publish('datatitle',null, '数据总览');
// }
	        
	    },
	render:function() {
		   return (	<ul className="nav side-menu">
		   	<li onClick = {this.handleClick.bind(this,'overview')} ><a><i className="fa fa-home"></i>数据总览<span
			className="fa fa-chevron-down"></span></a></li>
			<li onClick = {this.handleClick.bind(this,'userAnalysis')} ><a><i className="fa fa-user"></i>用户分析<span
			className="fa fa-chevron-down"></span></a></li> 
			<li onClick = {this.handleClick.bind(this,'financeAnalysis')}><a><i className="fa fa-money"></i> 金额分析 <span
			className="fa fa-chevron-down"></span></a></li>
			<li onClick = {this.handleClick.bind(this,'functionAnalysis')}><a><i className="fa fa-edit"></i> 功能分析 <span
			className="fa fa-chevron-down"></span></a></li>
			<li onClick = {this.handleClick.bind(this,'otherAnalysis')}><a><i className="fa fa-bug"></i> 其他分析 <span
			className="fa fa-chevron-down"></span></a></li>
	        
		</ul>);
		   },
});
var Books = React.createClass({
	  render: function() {
	    return (
	      <ul>
	   图书
	      </ul>
	    );
	  }
	});

var Movies = React.createClass({
	  componentDidMount: function () {
	 // pubsub_token = pubsub.subscribe('datatitle', function (topic,
		// title) {
	    	
	 // }.bind(this));
	  },
	  componentWillUnmount: function () {
		  console.log('------');
	// pubsub.unsubscribe('datatitle');
	  },
	  render: function() {
	    return (
	      <ul>
	       电影
	      </ul>
	    );
	  }
	});

// 定义页面上的路由
var routes = (
<Route handler={browserHistory}>
<Route name="" handler={Overviewtable} />	
 <Route name="overview" handler={Overviewtable} />
 <Route name="userAnalysis" handler={Usertable} />
 <Route name="financeAnalysis" handler={Financetable} />
 <Route name="functionAnalysis" handler={Functiontable} />
 <Route name="otherAnalysis" handler={Othergraph} />	
</Route>
);


var Datashow=React.createClass({

 render: function() {
	    return (
	    		<RouteHandler />
	    );
	  }
});


var Datatitle=React.createClass({
	  getInitialState: function() {
		    return {
		    	datatitle: '数据总览'
		    };
		  },
  componentDidMount: function () {
	    pubsub_token = PubSub.subscribe('datatitle', function (topic, title) {
	    	  this.setState({
	    	        datatitle: title
	    	      });
	    }.bind(this));
	  },
	  componentWillUnmount: function () {
		  PubSub.unsubscribe('search');
	  },
 render: function() {
	    return (
			<h3>
			{this.state.datatitle}<small></small>
			</h3>
	    );
	  }
});



Router.run(routes, Router.HashLocation, function(Root){
	  React.render(<Root />, document.getElementById('container'));
	});


React.render(
	<Datanavcat />,
	document.getElementById('data_navcat')
);
React.render(
	<Datatitle />,
	document.getElementById('data_title')
);

/*
 * React.render( <TableBox url='' />,
 * 
 * <RouteHandler />, <Datashow />, document.getElementById('container') );
 */

})

