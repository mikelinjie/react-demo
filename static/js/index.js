var pubsub =  Pubsub.create();
var Router = ReactRouter; // 由于是html直接引用的库，所以 ReactRouter 是以全局变量的形式挂在 window 上
var Route = ReactRouter.Route; 
var RouteHandler = ReactRouter.RouteHandler;
var Link = ReactRouter.Link;
var StateMixin = ReactRouter.State;
var browserHistory = ReactRouter.browserHistory

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


$(function(){
	var timer;
	var overviewChart;
	   laydate({
           elem: '#inpstart'
       });
	   laydate({
           elem: '#inpend'
       });
		$("#inpstart").val(new Date(new Date().getTime()-864000000).format("yyyy-MM-dd"));
		$("#inpend").val(new Date(new Date().getTime()-86400000).format("yyyy-MM-dd"));
	// --------search
	$("#search").click(function(){
		var t=$("#inpstart").val()+','+$("#inpend").val();
		if(t.length<12) return;
	
		pubsub.publish('search',null,t);
		console.log('Search事件');
	});
	
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
					overviewChart.setOption(option);
			  }.bind(this),
			  error:function(){}
		  });
	

	  },
	  componentDidMount: function() {
		  $("#search_div").hide();
		  pubsub.publish('datatitle',null,'数据总览' );
		  this.loadDataCountFromServer();
		  this.setState({
				realtimeData:[], 
		  })
		  overviewChart = echarts.init(document.getElementById('graph3'));
		  console.log(this.getRealtimeData);
		  this.getRealtimeData();
		  timer=setInterval(this.getRealtimeData,120000);

	  },
	 
	  componentWillUnmount: function () {
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
					<hr /> 
					 <div id="graph3" className="graph1"></div>
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
		  $("#search_div").show();
		  pubsub.publish('datatitle',null,'用户分析' );
		this.pubsub_token = pubsub.subscribe('search', function (context, time) {
			var t=time.split(',');
				this.setState({
	  	        timeStart: t[0],
	  	        timeEnd:t[1]
	  	      });
			  
			console.log("收到消息------"+time);
		    this.loadDataCountFromServer();
		    }.bind(this));
	    this.loadDataCountFromServer();
	  },
	  componentWillUnmount: function () {
		  pubsub.unsubscribe(this.pubsub_token);
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
		  $("#search_div").show();
		  pubsub.publish('datatitle',null,'金额分析' );
		this.pubsub_token = pubsub.subscribe('search', function (context, time) {
			var t=time.split(',');
				this.setState({
	  	        timeStart: t[0],
	  	        timeEnd:t[1]
	  	      });
			  
			console.log("收到消息------"+time);
		    this.loadDataCountFromServer();
		    }.bind(this));
	    this.loadDataCountFromServer();
	  },
	  componentWillUnmount: function () {
		  pubsub.unsubscribe(this.pubsub_token);
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
					<td>{this.state.overview.a_distributedVoucherUsers}</td>
					<td>{this.state.overview.a_distributedVoucherTimes}</td>
					<td>{this.state.overview.a_distributedVoucherMoney}</td>
					<td>{this.state.overview.a_rebackUsers}</td>
					<td>{this.state.overview.a_rebackMoney}</td>
				</tbody>
			</table>
			<hr></hr>
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


var Functiontable = React.createClass({
  getInitialState: function() {

    return {
    	data: {},
    	timeStart:new Date(new Date().getTime()-864000000).format("yyyy-MM-dd"),
    	timeEnd:new Date(new Date().getTime()-86400000).format("yyyy-MM-dd")
    };
  },
	
  componentDidMount: function() {
	  $("#search_div").show();
	  pubsub.publish('datatitle',null,'功能分析' );
	this.pubsub_token = pubsub.subscribe('search', function (context, time) {
		var t=time.split(',');
			this.setState({
  	        timeStart: t[0],
  	        timeEnd:t[1]
  	      });
		  
		console.log("收到消息------"+time);
	    this.loadDataCountFromServer();
	    }.bind(this));
    this.loadDataCountFromServer();
  },
  componentWillUnmount: function () {
	  pubsub.unsubscribe(this.pubsub_token);
  },
  loadDataCountFromServer: function(){
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
			  console.log(this.state.data);
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
						<td>{node.nceUsers}</td>
						<td>{node.nceApps}</td>
						<td>{node.nceMoney}</td>
						<td>{node.nseUsers}</td>
						<td>{node.nseApps}</td>
						<td>{node.nseMoney}</td>
						<td>{node.rdsUsers}</td>
						<td>{node.rdsApps}</td>
						<td>{node.rdsMoney}</td>
						<td>{node.ncrUsers}</td>
						<td>{node.ncrApps}</td>
						<td>{node.ncrMoney}</td>
						<td>{node.nlbUsers}</td>
						<td>{node.nlbApps}</td>
						<td>{node.nlbMoney}</td>
					</tr>	
				);
			}); 
	 
   return (
		   <table className="table">
	
			<thead>
				<tr>
					<th>时间</th>
					<th title="容器人数">NCE人数</th>
					<th title="产生消费的容器实例数">NCE实例数</th>
					<th title="容器消费额">NCE消费额</th>
					<th title="集群人数">NSE人数</th>
					<th title="产生消费的集群实例数">NSE实例数</th>
					<th title="集群消费额">NSE消费额</th>
					<th title="数据库人数">RDS人数</th>
					<th title="产生消费的数据库实例数">RDS实例数</th>
					<th title="数据库消费额">RDS消费额</th>
					<th title="缓存人数">NCR人数</th>
					<th title="产生消费的缓存实例数">NCR实例数</th>
					<th title="缓存消费额">NCR消费金额</th>
					<th title="负载均衡人数">NLB人数</th>
					<th title="产生消费的负载均衡实例数">NLB实例数</th>
					<th title="负载均衡消费额">NLB消费额</th>
				</tr>
			</thead>
			<tbody>
				{nodes}
			</tbody>
		</table>
   );
 },

});


var Othergraph = React.createClass({
	  getInitialState: function() {
	    return {data: []};
	  },

	  componentDidMount: function() {
		  $("#search_div").hide();
		  pubsub.publish('datatitle',null,'其他分析' );
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
	 // this.pubsub_token = pubsub.subscribe('datatitle', function (topic,
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
	    this.pubsub_token = pubsub.subscribe('datatitle', function (topic, title) {
	    	  this.setState({
	    	        datatitle: title
	    	      });
	    }.bind(this));
	  },
	  componentWillUnmount: function () {
		  pubsub.unsubscribe('datatitle');
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

