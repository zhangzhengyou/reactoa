import React, { PropTypes } from 'react'
import Immutable from 'immutable'

import styles from './add.scss'

import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number' 
const FormItem = Form.Item
import Select from 'antd/lib/select'
const Option = Select.Option
import Upload from 'antd/lib/upload'
import Icon from 'antd/lib/icon'
import Col from 'antd/lib/col'
import Message from 'antd/lib/message'

import AddStorePicModal from './addModal'

@Form.create()
export default class addStoreComp extends React.Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			cityData:[],
			cityDisable:true,
			regionData:[],
			regionDisable:true,
			locations:'',
			storeAddPic_visible:false,
			allstoreAddPics:{
				count:0, 
				list:[] 
			},
			curChosedPic:1,
			chosedPic:[],
			chosedPicAll:[],
			isGuidLocate:false,
			startChosedPic:0,
			jumpPage:0,
			searchMapRet:[],
			choosedLocation:[],
			allMarkers:[]
		}
	}

	static propTypes = {
		storeListPics:PropTypes.instanceOf(Immutable.Map).isRequired,
		storeListParams: PropTypes.instanceOf(Immutable.Map).isRequired
	}

	static contextTypes = {
		router: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired
	}


	componentDidMount() {
		this.initMap()
	}


	initMap() {
	  	const QQMap = new qq.maps.Map(document.getElementById("map-container"), { zoom:15 })
	  	this.QQMap = QQMap
	  	//获取城市列表接口设置中心点
    	const citylocation = new qq.maps.CityService({
       		complete : function(result){
            	QQMap.setCenter(result.detail.latLng);
        	}
    	})
    	//调用searchLocalCity() 根据用户IP查询城市信息。
    	citylocation.searchLocalCity()

    	const info = new qq.maps.InfoWindow({
    		map: QQMap
    	})
    	this.info = info 
	}

	mapStartLocated = () => {
		this.setState({
			isGuidLocate:false
		})
		//点击搜索标记产生标记
		const marker = new qq.maps.Marker({
			position: this.QQMap.getCenter(),
			map: this.QQMap
		})
		this.marker = marker
		this.info.open()
		this.info.setContent(`<div>找不到门店地址,拖拽创建新标注</div>	`)
		this.info.setPosition(this.marker.getPosition())

		marker.setAnimation(qq.maps.MarkerAnimation.DOWN)
		marker.setDraggable(true)

		qq.maps.event.addListener(marker, 'dragstart', () => {
			this.info.close()
		})
		qq.maps.event.addListener(marker, 'dragend', () => {
			this.setInfoWin()
		})
	}

	setInfoWin = () => {
		this.info.open()

		const eleDiv = document.createElement('div')
		const p = document.createElement('p')
		p.innerHTML = '是否使用此位置作为门店的定位？'
		const btn = document.createElement('div')
		btn.innerHTML = '确定'
		btn.onclick = ()=> {
			this.marker.setDraggable(false)
			this.info.close()
			this.QQMap.setZoom(17)
			this.QQMap.setCenter(this.marker.getPosition())
			const allOtherMarkers = this.state.allMarkers.filter(item => item != this.marker)
			const chosedMarker = this.state.allMarkers.filter(item => item == this.marker)
			if(allOtherMarkers){
				for(let i in allOtherMarkers){
					allOtherMarkers[i].setMap(null)
				}
			}

			const location = this.marker.getPosition().lat +','+ this.marker.getPosition().lng
			this.props.actions.getDetailLocation(location).then(response => {
				let address = ''
				const ret = response.data.result
				if(ret.address_component.street_number != ''){
					address = ret.address_component.street_number
				}else{
					address = ret.address_component.street
				}
				this.props.form.setFieldsValue({['searchKeyword']:address})

				this.setState({
					isGuidLocate: false,
					choosedLocation: this.marker.getPosition(),
					allMarkers: [...chosedMarker]
				})				
			})		
		}
	
		const style = {
			width: '100px',
			color: '#fff',
			background:'#44b549',
			textAlign: 'center',
			cursor:'pointer'
		}

		for(let i in style) {
			btn.style[i] = style[i]
		}

		eleDiv.appendChild(p)
		eleDiv.appendChild(btn)
		
		this.info.setContent(eleDiv)
		this.info.setPosition(this.marker.getPosition())
	}

	handleCategoryChange = value => {
		this.props.actions.getStoresEditSelect({ categoryId: value }).then(response => {
			this.props.form.setFieldsValue({['categoryChild']:undefined})
		})
	}

	handleTopDisChange = value => {
		//初始化二级行政区 选项
		this.props.form.setFieldsValue({['topDisSecChild']:undefined})
		this.props.form.setFieldsValue({['topDisThirdChild']:undefined})

		const strValue = value
		const topDisValue = strValue.split('-')[0]
		let topDisLocation = strValue.split('-')[1]
		topDisLocation = JSON.parse(topDisLocation.substr(4))
		const center = new qq.maps.LatLng(topDisLocation.lat,topDisLocation.lng)
		this.QQMap.setCenter(center)
		this.QQMap.setZoom(10)

		this.props.actions.getTopDistrictsChild(topDisValue).then(response => {
			const cityRet = response.data.result[0]
			this.cityRet = cityRet
			this.setState({
				cityData:cityRet,
				cityDisable:false
			})
		})
	}

	hanldeTopDisSecChange = value => {
		//初始化三级行政区 选项
		this.props.form.setFieldsValue({['topDisThirdChild']:undefined})
	
		const strValue = value
		const cityId = strValue.split('-')[0]
		const [ city ]   = this.cityRet.filter(item => item.id == cityId)
		const secDisLocation = city.location
		const center = new qq.maps.LatLng(secDisLocation.lat, secDisLocation.lng)
		this.QQMap.setCenter(center)
		this.QQMap.setZoom(14)

		this.props.actions.getTopDistrictsChild(cityId).then(response => {
			const regionRet = response.data.result[0]
			this.regionRet = regionRet
			this.setState({
				regionData:regionRet,
				regionDisable:false
			})
		})
	}

	hanldeTopDisThirdChange = value => {
		if(value != '-1') {
			const strValue = value
			const regionId = strValue.split('-')[0] 
			const [ region ] = this.regionRet.filter(item => item.id == regionId)
			const thirdDisLocation = region.location
			const center = new qq.maps.LatLng(thirdDisLocation.lat, thirdDisLocation.lng)
			this.QQMap.setCenter(center)
			this.QQMap.setZoom(16)
		}
	}

	searchMap = () => {
		const proviceChosed = this.props.form.getFieldValue(['topDistricts'])||'-1'
		const cityChosed = this.props.form.getFieldValue(['topDisSecChild'])||'-1'
		const keyWord = this.props.form.getFieldValue(['searchKeyword'])||''
		console.log(keyWord)
		if(proviceChosed == '-1'){
			Message.info('请输入省份')
		}else if(cityChosed == '-1'){
			Message.info('请输入市区')
		}
		else if(keyWord == ''){
			Message.info('请输入关键字')
		}else {
			const cityChosedId = cityChosed.split('-')[0]
			const [ city ]   = this.cityRet.filter(item => item.id == cityChosedId)
			const cityName = city.name
			const params = {
				regionCity: cityName,
				keyWord: keyWord,
				page:1,
				psize:10
			}
			this.props.actions.searchMapBykeyword({...params}).then(response => {
				if(this.state.allMarkers){
					for(let i in this.state.allMarkers){
						this.state.allMarkers[i].setMap(null)
					}
					this.info.close()
					this.setState({
						allMarkers:[]
					})
				}			
				
				//若数据太多，只截取10条数据
				const ret = response.data.data.slice(0,10)
				this.setState({
					searchMapRet:ret,
					isGuidLocate:true
				})
			})
		}
	}

	getMarkerListX = (location) => {
		const center = new qq.maps.LatLng(location.lat,location.lng)
		this.QQMap.setCenter(center)
		const marker =new qq.maps.Marker({
			position: center,
			map: this.QQMap
		})
		this.setState({
			allMarkers:[...this.state.allMarkers, marker]
		})
		marker.setAnimation(qq.maps.MarkerAnimation.DOWN)
		marker.setDraggable(true)	
		this.marker = marker 
		this.setInfoWin()

		qq.maps.event.addListener(marker, 'dragstart', () => {
			this.info.close()
		})
		qq.maps.event.addListener(marker, 'dragend', () => {
			this.setInfoWin()
		})
		qq.maps.event.addListener(marker,'click', () => {
			this.marker = marker 
			this.info.close()
			this.setInfoWin()
		})      
	}

	addStorePic = () => {
		this.props.actions.fetchCardVoucherPhotos({ page:1,psize:8 }).then(response => {
		 	this.setState({
				storeAddPic_visible:true
			})
		})		
	}

	handleCancel = () => {
		this.setState({
			storeAddPic_visible:false
		})
	} 

	handleSure = ids => {
		this.setState({
			storeAddPic_visible:false,
			chosedPicAll: [...this.state.chosedPic]
		})
	}

	handleChosePic = id => {
		if(this.state.chosedPic.length == 0){
			this.props.actions.fetchCardVoucherPhotos({}).then(response => {
				this.allPhotos = response.result.list
				const choseOne = this.allPhotos.filter(item => item.id == id)
				this.setState({
					chosedPic: [...choseOne]
				})
			})	
		}else{
			const picIndex = this.state.chosedPic.findIndex(item => item.id == id)
			if(picIndex == -1) {
				const choseOne = this.allPhotos.filter(item => item.id == id )
				this.setState({
					chosedPic: [...this.state.chosedPic,...choseOne]
				})
			}else{
				this.setState({
					chosedPic: this.state.chosedPic.filter(item => item.id != id)
				})
			}
		}
	}

	handlePrepage = () => {
		const curPage = this.state.curChosedPic
		if(curPage > 1) {
			this.setState({
				curChosedPic: curPage - 1,
				startChosedPic: this.state.startChosedPic - 7
			})
		}
	}

	handleNextpage = () => {
		const curPage = this.state.curChosedPic
		const totalPage = Math.ceil(this.state.chosedPic.length / 7)
		if(curPage < totalPage){
			this.setState({
				curChosedPic: curPage + 1,
				startChosedPic: this.state.startChosedPic + 7
			})
		}
	}

	hanlePageChange = value => {
		this.setState({
			jumpPage:value
		})
	} 

	handleJumppage = () => {
		const totalPage = Math.ceil(this.state.chosedPic.length / 7)
		if(this.state.jumpPage <= totalPage){
			this.setState({
				curChosedPic: this.state.jumpPage,
				startChosedPic:(this.state.jumpPage - 1) * 7
			})
		}else{
			Message.error('请输入正确的页数')
		}
	} 

	handleDelPic = id => {
		const chosedPicAll = this.state.chosedPicAll.filter(item => item.id != id)
		const chosedPic = this.state.chosedPic.filter(item => item.id != id)
		this.setState({
			chosedPic:[...chosedPic],
			chosedPicAll:[...chosedPicAll] 
		})
	}

	handleSubmit = () => {
		this.props.form.validateFieldsAndScroll((errors) => {
			if(!!errors){
				return
			}
			if(this.state.choosedLocation.length == 0){
				Message.error('请搜索地图进行标注哦~')
				return
			}
			
			let values = {}
			values.business_name = this.props.form.getFieldValue('businessName')
			values.branch_name = this.props.form.getFieldValue('branchNameProps')
			values.telephone = this.props.form.getFieldValue('telephone')
			const category = this.props.form.getFieldValue('categoryList')
			const categoryChild = this.props.form.getFieldValue('categoryChild')
			let categoryArr = [category, categoryChild]
			values.categories = categoryArr
			values.province = this.props.form.getFieldValue('topDistricts').split('-')[2]
			values.city = this.props.form.getFieldValue('topDisSecChild').split('-')[1]
			values.district = this.props.form.getFieldValue('topDisThirdChild').split('-')[1]
			values.address = this.props.form.getFieldValue('searchKeyword')
			values.latitude = this.state.choosedLocation.lat
			values.longitude = this.state.choosedLocation.lng
			values.open_time = this.props.form.getFieldValue('open_time')
			values.recommend = this.props.form.getFieldValue('recommend')
			values.special = this.props.form.getFieldValue('special')
			values.avg_price = this.props.form.getFieldValue('avg_price')
			values.introduction = this.props.form.getFieldValue('introduction')
			values.offset_type = this.props.form.getFieldProps('offsetType')

			let chosedPicArr = []
			this.state.chosedPicAll.forEach(item => chosedPicArr.push(item.id))
			values.photo_list = chosedPicArr
			this.props.actions.addStore(values).then(response => {
				Message.success(response.errormsg)
				this.context.router.push('/card-voucher/store/index')
			})
		})
	}

	renderToolbar(){
		return(
			<div className="toolbar">
				<Button type="ghost" style={{marginLeft:10}} onClick={() => {history.back()}}>返回</Button>
			</div>
		)
	}

	renderTable() {
		const { getFieldProps, getFieldValue } = this.props.form
		const formItemProps ={
			labelCol:{ span: 2 },
			wrapperCol:{ span: 15 }
		}
		const districtFormItemProps = {
			labelCol:{ span: 2 },
			wrapperCol:{ span: 20 }
		}

		const acnameProps = getFieldProps('acname',{
			initialValue: this.props.acname
		})

		const businessNameProps = getFieldProps('businessName',{
			rules: [
				{ required:true, message:'请输入门店名称' }
			]
		})

		const branchNameProps = getFieldProps('branchNameProps',{
			rules:[
				{ required:true, message:'请输入分店名称'}
			]
		})

		const telephoneProps = getFieldProps('telephone',{
			rules:[
				{ required:true,message:'请输入门店电话'}
			]
		})

		const selectData = this.props.selectData
		const categoryListProps = getFieldProps('categoryList',{
			rules:[
				{ required:true, message:'请输入门店类型'}
			],
			onChange:this.handleCategoryChange
		})

		const categoryChildProps = getFieldProps('categoryChild',{
			rules:[
				{ required:true, message:'请输入门店类型'}
			]
		})

		const offsetTypeProps = getFieldProps('offsetType',{
			rules:[
				{ required:true, message:'请输入坐标类型' }
			]
		})

		const topDistrictsProps = getFieldProps('topDistricts',{
			rules:[
				{ required:true, message:'请输入详细地址'}
			],
			onChange:this.handleTopDisChange
		})

		const topDisSecChildProps = getFieldProps('topDisSecChild',{
			rules:[
				{ required:true, message:'请输入详细地址'}
			],
			onChange:this.hanldeTopDisSecChange
		})

		const topDisThirdChildProps = getFieldProps('topDisThirdChild',{
			rules:[
				{ required:true, message:'请输入详细地址'}
			],
			onChange:this.hanldeTopDisThirdChange
		})

		const searchKeywordProps = getFieldProps('searchKeyword', {
			rules:[
				{ required:true, message:'请输入详细街道地址'}
			]
		})

		return (
			<div>
				<Form horizontal>
					<div className={styles.basicInfo}>
						<div>基本信息</div>
					</div>
					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='公众号：'
					>
						<Col span="8">
							<FormItem>
								<Input { ...acnameProps } disabled/>
							</FormItem>
						</Col>						
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='门店名称：'
					 	required
					>
						<Col span="8">
							<FormItem
								hasFeedback
							>
								<Input {...businessNameProps} />
							</FormItem>
						</Col>						
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='分店名称：'
						required
					>
						<Col span="8">
							<FormItem
								hasFeedback
							>
								<Input {...branchNameProps}/>
							</FormItem>
						</Col>						
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='门店电话：'
						required
					>
						<Col span="8">
							<FormItem
								hasFeedback
							>
								<Input {...telephoneProps}/>
							</FormItem>
						</Col>
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='门店类型：'
						required						
					>
						<Col span="4">
							<FormItem
								hasFeedback
							>
								<Select {...categoryListProps } placeholder="请选择">
									{
										selectData.get('categoryList').map(item => 									
											<Option key={'category'+item.get('id')} value={item.get('id')+''}>{item.get('name')}</Option>
										)	
									}							
								</Select>
							</FormItem>
						</Col>
						<Col span="4">
							<FormItem 
								style={{marginLeft:10}}
								hasFeedback
							>
								<Select { ...categoryChildProps } placeholder="请选择">
									{
										selectData.get('categoryChild').map(item =>
											<Option key={'categoryChild'+item.get('id')} value={item.get('id')+''}>{item.get('name')}</Option>
										)
									}
								</Select>
							</FormItem>
						</Col>
					</FormItem>

					<FormItem
						{...districtFormItemProps}
						className={styles.formItem}
						label='地址：'
						required
					>
						<Col span="2">
							<FormItem
								hasFeedback
							>
								<Select placeholder="请选择" {...topDistrictsProps }>
									{
										this.props.topDistricts.map(item => 
											<Option key={'topDistricts'+item.get('id')} value={ item.get('id') +'-'+ item.get('location') +'-'+ item.get('name') }>{item.get('name')}</Option>
										)
									}
								</Select>								
							</FormItem>
						</Col>
					
						<Col span="3">
							<FormItem 
								style={{marginLeft:10}}
								hasFeedback
							>
								<Select {...topDisSecChildProps} placeholder="请选择" disabled={this.state.cityDisable}>
									{
										this.state.cityData.map(item =>
											<Option key={'topDisSec'+item.id} value={ item.id +'-'+ item.name }>{item.name}</Option>
										)
									}
								</Select>
							</FormItem>
						</Col>
						
						<Col span="3">
							<FormItem 
								style={{marginLeft:10}}
								hasFeedback
							>
								<Select {...topDisThirdChildProps} placeholder="请选择" disabled={this.state.regionDisable}>
									{
										this.state.regionData.map(item =>
											<Option key={'topDisThird'+item.id} value={ item.id +'-'+ item.fullname }>{item.fullname}</Option>
										)
									}
								</Select> 
							</FormItem>
						</Col>							
						
						<Col span="5">
							<FormItem 
								style={{marginLeft:10}}
								hasFeedback
							>
								<Input placeholder="请输入详细地址,勿重复填写省市区信息" {...searchKeywordProps}/>
							</FormItem>		
						</Col>
						<Col span="2">
							<Button type="ghost" size="large" style={{marginLeft:10}} onClick={this.searchMap}>搜索地图</Button>
						</Col>												
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='定位：'
					>
						<div className={styles.mapContainer}>
							{
								this.state.isGuidLocate?
								<div className={styles.mapContNav}>
									<div className={styles.markResult}>共找到<span>
										{
											this.state.searchMapRet.length > 0 ? this.state.searchMapRet.length:0
										}
									</span>处位置</div>
									<ul className={styles.markResultList}>
									{
										this.state.searchMapRet.map(item => {
											return (	
												<li className={styles.markResultListX} key={'mapResult'+item.id} onClick={() => this.getMarkerListX(item.location)}>
													<div className={styles.listNav}>
													</div>
													<div className={styles.listCont}>
														<p className={styles.listContTitle}>{item.title}</p>
														<p className={styles.listContX}>地址：{item.address}</p>
													</div>
												</li>
											)
										})
									}
									<div className={styles.markTips}>找不到合适的地址？<a onClick={ this.mapStartLocated }>标注新地址</a></div>
									</ul>
								</div> : ''
							}

							<div id="map-container" className={styles.mapCont}>
							</div>
						</div>						
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='坐标类型：'
						required
					>
						<Col  span="8">
							<FormItem
								hasFeedback
							>
								<Select placeholder="请选择" {...offsetTypeProps}>
									{
										selectData.get('offsetType').map(item => 
											<Option key={'offsettype'+item.get('id')} value={item.get('id')+''}>{item.get('name')}</Option>
										)
									}
								</Select>
							</FormItem>
						</Col>					
					</FormItem>

					<div className={styles.service}>
						<div>服务信息</div>
					</div>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='门店图片：'
					>
						<div className={styles.allChosed}>
							<div className={styles.allChosedCont}>
								<div className={styles.multiUpload} onClick={this.addStorePic}>
									<span>
										<Icon type="plus"></Icon>
									</span>
								</div>
								{
									this.state.chosedPicAll.slice(this.state.startChosedPic,this.state.startChosedPic + 7).map(item => {
										return (
											<div className={styles.chosedOnePic} key={'chosedPic'+item.id}>
												<img src={this.props.assetsUrl + item.img_url}/>
												<div className={styles.deleteBg}>
													<div className={styles.deletePic} onClick={ () => this.handleDelPic(item.id) }></div>
												</div>
											</div>	
										)
									})
								}
							</div>
							{
								this.state.chosedPicAll.length > 7 ? 
									<div className={styles.allChosedFooter}>
										<Button type="ghost" onClick={this.handlePrepage} disabled={ this.state.curChosedPic == 1 ? true: false }><Icon type="left"/></Button>
			 							<div className={styles.footNums}> { this.state.curChosedPic }/{ Math.ceil(this.state.chosedPicAll.length / 7) }</div>
			 							<Button type="ghost" style={{ marginLeft:8 }} onClick={this.handleNextpage} disabled={ this.state.curChosedPic == Math.ceil(this.state.chosedPicAll.length / 7) ? true: false }><Icon type="right"/></Button>
			 							<InputNumber style={{ width:50,marginLeft:8 }} min={1} onChange={this.hanlePageChange}/>
			 							<Button type="ghost" onClick={this.handleJumppage} style={{ marginLeft:8 }}>跳转</Button>
									</div> : ''
							}
						</div>							
					</FormItem>

					<FormItem
					    {...formItemProps}
					    className={styles.formItem}
					    label='营业时间：'
					>
						<Col span="8">
							<FormItem>
							<Input { ...getFieldProps('open_time') }/>
							<div className={styles.tips}>如,10:00-21:00</div>
							</FormItem>
						</Col>						
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='推荐：'
					>	
						<Col span="8">
							<FormItem>
							<Input type="textarea" { ...getFieldProps('recommend') }/>	
							<div className={styles.tips}>如,推荐菜,推荐景点,推荐房间</div>		
							</FormItem>
						</Col>							
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='特色服务：'
					>
						<Col span="8">
							<FormItem>
							<Input type="textarea" { ...getFieldProps('special') }/>
							<div className={styles.tips}>如,免费停车,WIFI</div>	
							</FormItem>
						</Col>						
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='人均价格：'
					>
						<Col span="8">
							<FormItem>
							<Input { ...getFieldProps('avg_price') }/>
							<div className={styles.tips}>大于零的整数,需如实填写,默认单位为人民币</div>
							</FormItem>
						</Col>						
					</FormItem>

					<FormItem
						{...formItemProps}
						className={styles.formItem}
						label='门店简介：'
					>
						<Col span="8">
							<FormItem>
							<Input type="textarea" { ...getFieldProps('introduction') }/>
							<div className={styles.tips}>对品牌或者门店的简要介绍</div>
							</FormItem>
						</Col>						
					</FormItem>

					<FormItem
					>
						<Col offset="2">
							<Button type="primary" onClick={this.handleSubmit}>提交</Button>
							<Button type="ghost" style={{marginLeft:20}} onClick={ () => { history.back()}}>返回</Button>
						</Col>
					</FormItem>
				</Form>
			</div>
		)
	}

	render() {
		return(
			<div>
				{this.renderToolbar()}
				{this.renderTable()}
				<AddStorePicModal  
					visible={this.state.storeAddPic_visible}
					uploadFile={this.props.actions.uploadFile}
					handleCancel={this.handleCancel}
					fetchCardVoucherPhotos={this.props.actions.fetchCardVoucherPhotos}
					allstoreAddPics={this.props.storeListPics.toJS()}
					storeListParams={this.props.storeListParams.toJS()}
					handleSure={this.handleSure}
					assetsUrl={this.props.assetsUrl}
					chosedPic={this.state.chosedPic}
					handleChosePic={this.handleChosePic}
				>
				</AddStorePicModal>
			</div>
		)
	}

}