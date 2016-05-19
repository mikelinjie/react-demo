var RecordBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },

  componentDidMount: function() {
    this.loadDataCountFromServer();
  },

 render: function() {
   return (
     <div>哈哈</div>
   );
 },
  loadDataCountFromServer: function(){
    $.ajax({
        url:'../newest',
        datatype:'json',
        type:'POST',
        success:function(data){
        	console.log(data);
        	var d=JSON.parse(data);
        	var myChart = echarts.init(document.getElementById('main'));
        	myChart.setOption(d);
        	window.mychart=myChart;
        	
        }.bind(this),
        error:function(xhr,status,err){
           console.error(this.props.url, status, err.toString());
        }.bind(this)
    });
  },
})

React.render(
  <RecordBox url='./newest' />,
  document.getElementById('container')
);


window.onresize = function (){
	if(!$(window.mychart)){
	$(window.mychart).();}
}


/*
 * var pubsub = Pubsub.create();
 * 
 * var ProductList = React.createClass({ render: function () { return ( <div>
 * <ProductSelection /> <Product name="product 1" /> <Product name="product 2" />
 * <Product name="product 3" /> </div> ); } }); // 用于展示点击的产品信息容器 var
 * ProductSelection = React.createClass({ getInitialState: function() { return {
 * selection: 'none' }; }, componentDidMount: function () { this.pubsub_token =
 * pubsub.subscribe('products', function (topic, product) { this.setState({
 * selection: product }); }.bind(this)); }, componentWillUnmount: function () {
 * pubsub.unsubscribe(this.pubsub_token); }, render: function () { return ( <p>You
 * have selected the product : {this.state.selection}</p> ); } });
 * 
 * var Product = React.createClass({ onclick: function () {
 * pubsub.publish('products',null, this.props.name); }, render: function() {
 * return <div onClick={this.onclick}>{this.props.name}</div>; } });
 * 
 * React.render( <ProductList />, document.getElementById('container') );
 * 
 */


// var pubsub = Pubsub.create();
// var Router = ReactRouter; // 由于是html直接引用的库，所以 ReactRouter 是以全局变量的形式挂在 window
// 上
// var Route = ReactRouter.Route;
// var RouteHandler = ReactRouter.RouteHandler;
// var Link = ReactRouter.Link;
// var StateMixin = ReactRouter.State;
//
//
// function my_pub(){
// pubsub.publish('products',null, 'hahaha');
// }
//
// /**
// * 图书列表组件
// */
// var Books = React.createClass({
// componentDidMount: function () {
// this.pubsub_token = pubsub.subscribe('products', function (topic, product) {
// console.log('----------------Books');
// }.bind(this));
// },
// componentWillUnmount: function () {
// pubsub.unsubscribe('products');
// },
// render: function() {
// return (
// <ul>
// <li key={1}><Link to="book" params={{id: 1}}>活着</Link></li>
// <li key={2}><Link to="book" params={{id: 2}}>挪威的森林</Link></li>
// <li key={3}><Link to="book" params={{id: 3}}>从你的全世界走过</Link></li>
// <RouteHandler />
// </ul>
// );
// }
// });
//
// /**
// * 单本图书组件
// */
// var Book = React.createClass({
// mixins: [StateMixin],
//  
// render: function() {
// return (
// <article>
// <h1>这里是图书 id 为 {this.getParams()['id']} 的详情介绍</h1>
// </article>
// );
// }
// });
//
// /**
// * 电影列表组件
// */
// var Movies = React.createClass({
// componentDidMount: function () {
// console.log('----------------Movies---');
// this.pubsub_token = pubsub.subscribe('products', function (topic, product) {
// console.log('----------------Movies');
// }.bind(this));
// },
// componentWillUnmount: function () {
// pubsub.unsubscribe('products');
// },
// render: function() {
// return (
// <ul>
// <li key={1}><Link to="movie" params={{id: 1}}>煎饼侠</Link></li>
// <li key={2}><Link to="movie" params={{id: 2}}>捉妖记</Link></li>
// <li key={3}><Link to="movie" params={{id: 3}}>西游记之大圣归来</Link></li>
// </ul>
// );
// }
// });
//
// /**
// * 单部电影组件
// */
// var Movie = React.createClass({
// mixins: [StateMixin],
//  
// render: function() {
// return (
// <article>
// <h1>这里是电影 id 为 {this.getParams().id} 的详情介绍</h1>
// </article>
// );
// }
// });
//
//
//
//
//
//
// // 应用入口
// var App = React.createClass({
// render: function() {
// return (
// <div className="app">
// <nav>
// <a href="#"><Link to="movies">电影</Link></a>
// <a href="#"><Link to="books">图书</Link></a>
// </nav>
// <section>
// <RouteHandler />
// </section>
// </div>
// );
// }
// });
//
//
// // 定义页面上的路由
// var routes = (
// <Route handler={App}>
// <Route name="movies" handler={Movies} />
// <Route name="movie" path="/movie/:id" handler={Movie} />
// <Route name="books" handler={Books} />
// <Route name="book" path="/book/:id" handler={Book} />
// </Route>
// );
//
//
// // 将匹配的路由渲染到 DOM 中
// Router.run(routes, Router.HashLocation, function(Root){
// React.render(<Root />, document.getElementById('container'));
// });
