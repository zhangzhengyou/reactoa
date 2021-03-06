import React, { PropTypes } from 'react'

import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Icon from 'antd/lib/icon'
import Upload from 'antd/lib/upload'
import message from 'antd/lib/message'
import Select from 'antd/lib/select'
import TimePicker from 'antd/lib/time-picker'
import Modal from 'antd/lib/modal'


const FormItem = Form.Item
const Option = Select.Option

@Form.create()
export default class MainModal extends React.Component{
	constructor(props) {
		super(props)
		this.state = {
			img_url:''
		}
	}

	static contextTypes = {
		router: PropTypes.object.isRequired,
		location: PropTypes.object.isRequired
	}

	handleCancel() {
		this.props.toggle(undefined, 'visible_2')
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible === false) {
			this.props.form.resetFields()
		}
		if(!this.props.visible && Object.keys(nextProps.info).length) {
			this.setState({
				img_url: nextProps.info.thumb
			})
		}
	}

	handleSubmit() {
		this.props.form.validateFields((err, values) => {
			if(err) {
				return
			}
			values.thumb = this.state.img_url
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
		const info = this.props.info
		const select = this.props.select
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
				{ required: true, message: '请输入模板名称' }
			],
			initialValue: info.name 
		})

		const activityTypeProps = getFieldProps('activity_type', {
			rules: [
				{ required: true, message: '请选择活动类型' }
			],
			initialValue: info.activity_type+'' 

		})

		const screenTypeProps = getFieldProps('screen_type', {
			rules: [
				{ required: true, message: '请选择屏幕类型' }
			],
			initialValue: info.screen_type+'' 

		})

		const templateTypeProps = getFieldProps('template', {
			rules: [
				{ required: true, message: '请输入模板类型' }
			],
			initialValue: info.template

		})

		const remarkProps = getFieldProps('remark', {
			initialValue: info.remark
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
			<Form horizontal >
		        <FormItem
		          {...formItemLayout}
		          label="模板名称："
		          disabled
		          hasFeedback
		          >
		          <Input {...nameProps} />
		        </FormItem>

		         <FormItem
		          {...formItemLayout}
		          label="活动类型："
		          disabled
		          hasFeedback
		          >
		          <Select {...activityTypeProps}>
		          	{
		          		select.activityType.map(item => {
		          			return(
		          				<Option key={item.id} value={item.id+''}>{item.name}</Option>
		          			)
		          		})
		          	}
		          </Select>
		        </FormItem>

		        <FormItem
		          {...formItemLayout}
		          label="屏幕类型："
		          disabled
		          hasFeedback
		          >
		          <Select {...screenTypeProps}>
		          	{
		          		select.screenType.map(item => {
		          			return(
		          				<Option key={item.id} value={item.id+''}>{item.name}</Option>
		          			)
		          		})
		          	}
		          </Select>
		        </FormItem>

		        <FormItem
		          {...formItemLayout}
		          label="模板类型："
		          disabled
		          hasFeedback
		          >
		          <Input {...templateTypeProps} />
		        </FormItem>

		        <FormItem
		          {...formItemLayout}
		          label="缩略图："
		          hasFeedback
		          >
		            <Upload {...fileProps}>
						<Icon type="plus" />
					</Upload>
		        </FormItem>

		         <FormItem
		          {...formItemLayout}
		          label="备注："
		          disabled
		          hasFeedback
		          >
		          <Input {...remarkProps} type="textarea" rows="6"/>
		        </FormItem>
			</Form>
		)
	}

	render() {
		return(
			<Modal 
				title="新增"
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