import React, { PropTypes } from 'react'

import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Modal from 'antd/lib/modal'
import Upload from 'antd/lib/upload'
import format from 'Application/utils/formatDate'
import Button from 'antd/lib/button'
import Select from 'antd/lib/select'
import Icon from 'antd/lib/icon'
import message from 'antd/lib/message'

const FormItem = Form.Item
const Option = Select.Option

@Form.create()
export default class MainModal extends React.Component{
	constructor(props) {
		super(props)
		this.state = {
			img_url: ''
		}
	}

	handleCancel() {
		this.props.toggle(undefined, 'visible_2')
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible === false) {
			this.props.form.resetFields()
		}
		if(!this.props.visible && Object.keys(nextProps.info).length > 0) {
			this.setState({
				img_url: nextProps.info.cover_image
			})
		}
	}

	handleSubmit() {
		this.props.form.validateFields((err, values) => {
			if(err) {
				return
			}
			values.cover_image = this.state.img_url
			this.props.handleUpdate(values, this.props.info.id)
		})
	}

	uploadFile(file) {
		this.props.uploadFile(file).then(resolve => {
			message.success(resolve.errormsg)
			this.setState({
				img_url:resolve.result.file_url
			})
		})
	}


	renderForm() {

		const { getFieldProps } = this.props.form
		const select = this.props.select
		const info = this.props.info
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
				{ required: true, message: '请输入名称' }
			],
			initialValue: info.name 
		})

		const typeProps = getFieldProps('type', {
			rules: [
				{ required: true, type:'number', message: '请选择模板类型' }
			],
			initialValue: +info.type 
		})

		const urlProps = getFieldProps('url', {
			rules: [
				{ required: true, message: '请输入地址' }
			],
			initialValue: info.url 
		})

		const introProps = getFieldProps('intro', {
			initialValue: info.intro 
		})

		const fileProps = {
			accept: 'image/*',
			listType: 'picture-card',
			beforeUpload: this.uploadFile.bind(this),
			fileList: this.state.img_url ? [{
				uid: -1,
				status: 'done',
				url: this.props.assetsUrl + this.state.img_url
			}] : []
		}

		return(
			<Form horizontal>
		        <FormItem
		          {...formItemLayout}
		          label="名称："
		          hasFeedback
		          >
		           <Input {...nameProps}/>
		        </FormItem>

		        <FormItem  {...formItemLayout} label="类型：" hasFeedback>
	        	 	<Select {...typeProps} placeholder="请选择模板类型">
	        	 		{
	        	 			select.map(item => {
	        	 				return (
	        	 					<Option key={item.id} value={+item.id+''}>{item.name}</Option>
	        	 				)
	        	 			})
	        	 		}
	        	 	</Select>
	        	</FormItem>
	        	
	        	 <FormItem
		          {...formItemLayout}
		          label="封面图："
		          hasFeedback
		          required
		          >
		          	<Upload {...fileProps}>
						<Icon type="plus" />
					</Upload>
		        </FormItem>

		         <FormItem
		          {...formItemLayout}
		          label="地址："
		          hasFeedback
		          >
		           <Input {...urlProps}/>
		        </FormItem>

		         <FormItem
		          {...formItemLayout}
		          label="简介："
		          hasFeedback
		          >
		           <Input {...introProps} type="textarea" rows="6"/>
		        </FormItem>


			</Form>
		)
	}

	render() {
		return(
			<Modal 
				title="编辑"
				visible={this.props.visible}
				cancelText='返回'
				onCancel={::this.handleCancel}
				confirmLoading={this.props.updateLoading}
				onOk={::this.handleSubmit}
			>
				{this.renderForm()}
			</Modal>
		)
	}
}