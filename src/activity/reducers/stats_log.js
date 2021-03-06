import createReducer from 'Application/utils/create-reducer'
import { 
	FETCH_ACTIVITY_STATSLOG_LIST,
	 } from 'activity/constants'
import Immutable from 'immutable'

const initialState = Immutable.fromJS({
	content: [],
	data: {},
	params: {
		page: 0,
		psize: 0,
		count: 0
	},
	select:{
		activityList:[],
		checkType:[]
	},
	pending: true
})

const actionHandlers = {
	[FETCH_ACTIVITY_STATSLOG_LIST]: (state, { response, params, select }) => {
		return state.update('content', x => Immutable.fromJS(response.result.list))
			.update('data', x => Immutable.fromJS(response.result))
			.update('select', x => Immutable.fromJS(select.result))
			.update('params', x => Immutable.fromJS(params))
			.update('pending', x => false)
	},

	['activityStatsLog']:  (state, { error }) => {
		return state.set('pending', false)
					.set('error', error)
	}
}


export default createReducer(initialState, actionHandlers)