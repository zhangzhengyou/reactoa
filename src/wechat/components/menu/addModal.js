import React, { PropTypes } from 'react'

import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Modal from 'antd/lib/modal'


const FormItem = Form.Item

const Option = Select.Option


@Form.create()
export default class MainModal extends React.Component{
	constructor(props) {
		super(props)
		this.state = {
			type: '',
		}
	}

	handleCancel() {
		this.props.toggle(undefined, 'visible_1')
	}

	handleSubmit() {
		this.props.form.validateFields((err, values) => {
			if(err) {
				return
			}
			if(this.props.info){
				values.parent_id = this.props.info.id
				values.type = this.state.type
				if(values.type == 'media_id') values.value = values.media
				if(values.type == 'view_limited') values.value = values.view
			}else{
				values.parent_id = 0
			}
			this.props.handleAdd(values)
		})
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible === false) {
			this.props.form.resetFields()
		}
	}

	onChangeType(value) {
		this.setState({
			type: value
		})
	}

	checkMenuName(rule, value = '', callback) {
	    const { validateFields } = this.props.form
	    if (Object.keys(this.props.info).length == 0 && value.replace(/[^\x00-\xff]/g, "**").length > 10) {
	      callback('一级菜单名称不得大于15字节')
	    }
	    if(Object.keys(this.props.info).length > 0  && value.replace(/[^\x00-\xff]/g, "**").length > 16) {
	      callback('二级级菜单名称不得大于24字节')
	    }
	    callback()
	 }

	renderForm() {

		const { getFieldProps } = this.props.form

		const formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 14
			}
		}

		const nameProps = getFieldProps('name', {
			rules: [
				{ required: true, message: '请输入菜单名称' },
				{ validator: ::this.checkMenuName },
			]
		})

		const contentProps = getFieldProps('value', {
			
		})

		const typeProps = getFieldProps('type', {
			rules: [
				{ required: true, message: '请选择类型' }
			],
			onChange: ::this.onChangeType
		})

		const mediaProps = getFieldProps('media', {

		})

		const viewProps = getFieldProps('view', {

		})

		return(
			<Form horizontal >
				<FormItem 
				{...formItemLayout} 
				label="名称："
				hasFeedback
				>
					<Input {...nameProps}/>
				</FormItem>

				<FormItem  
				{...formItemLayout} 
				label="类型："
				hasFeedback
				>
    	        	<Select  {...typeProps}  placeholder="请选择类型" style={{ width: 180 }}>
    	        		{
    	        			this.props.select.menuType.map(item => {
    	        				return <Option key={item.key} value={item.key}>{item.value}</Option>
    	        			})
    	        		}
    	        	</Select>
		        </FormItem>

		       <div hidden={this.state.type != 'media_id'}>
			        <FormItem  
					{...formItemLayout} 
					label="素材："
					hasFeedback
					>
	    	        	<Select 
	    	        	 showSearch
	    	        	 notFoundContent="无法找到"
	    	        	 optionFilterProp="children"
	    	        	 {...mediaProps} 
	    	        	 placeholder="请选择素材" 
	    	        	 style={{ width: 180 }}
	    	        	 >
	    	        		{
	    	        			this.props.select.allMaterial.map(item => {
	    	        				return <Option key={item.id} value={item.id+''}>{item.name}</Option>
	    	        			})
	    	        		}
	    	        	</Select>
			        </FormItem>
				</div>

				<div hidden={this.state.type != 'view_limited'}>
			        <FormItem  
					{...formItemLayout} 
					label="图文："
					hasFeedback
					>
	    	        	<Select  
	    	        	 showSearch
	    	        	 notFoundContent="无法找到"
	    	        	 optionFilterProp="children"
	    	        	 {...viewProps}
	    	        	 placeholder="请选择图文" 
	    	        	 style={{ width: 180 }}
	    	        	 >
	    	        		{
	    	        			this.props.select.allTxt.map(item => {
	    	        				return <Option key={item.id} value={item.id+''}>{item.name}</Option>
	    	        			})
	    	        		}
	    	        	</Select>
			        </FormItem>
				</div>

				<div hidden={this.state.type == 'view_limited' || this.state.type == 'media_id' }>
					<FormItem 
					{...formItemLayout} 
					label="内容："
					hasFeedback
					>
						<Input {...contentProps}/>
					</FormItem>
				</div>
				
			</Form>
		)
	}

	render() {
		return(
			<Modal 
				title="新增菜单"
				visible={this.props.visible}
				cancelText='返回'
				onCancel={::this.handleCancel}
				confirmLoading={this.props.addLoading}
				onOk={::this.handleSubmit}
			>
				{this.renderForm()}
			</Modal>
		)
	}
}