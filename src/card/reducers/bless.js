import createReducer from 'Application/utils/create-reducer'
import { 
	FETCH_CARD_BLESS_LIST,
	ADD_CARD_BLESS_LIST,
	UPDATE_CARD_BLESS_LIST,
	DELETE_CARD_BLESS_LIST,
	FETCH_CARD_BLESS_AUTH
	 } from '../constants'
import Immutable from 'immutable'

const initialState = Immutable.fromJS({
	content: [],
	id: '',
	auth: [],
	select: [],
	params: {
		page: 0,
		psize: 0,
		count: 0
	},
	pending: true
})

const actionHandlers = {
	[FETCH_CARD_BLESS_LIST]: (state, { response, params, select }) => {
		
		return state.update('content', x => Immutable.fromJS(response.result.list))
			.update('select', x => Immutable.fromJS(select.result.CardsType))
			.update('params', x => Immutable.fromJS(params))
			.update('pending', x => false)
	},

	[ADD_CARD_BLESS_LIST]: (state, { response }) => {
		return state.update('content', x => x.unshift(Immutable.fromJS(response.result)))
					.updateIn(['params', 'count'], x => x + 1 )
	},

	[DELETE_CARD_BLESS_LIST]: (state, { response, id }) => {
		return state.update('content', x => x.filter(item => item.get('id') != id))
					.updateIn(['params', 'count'], x => x - 1)
	},

	[UPDATE_CARD_BLESS_LIST]: (state, { response }) => {
		return state.update('content', x => {
			const index = x.findIndex(item => item.toJS().id == response.result.id)
			if(index > -1) {
				return x.update(index, x => Immutable.fromJS(response.result))
			}
		})
	},

	[FETCH_CARD_BLESS_AUTH]: (state, { response, id }) => {
		return state.update('auth', x => Immutable.fromJS(response.result.CardsConfig))
	},

	['cardBless']:  (state, { error }) => {
		return state.set('pending', false)
					.set('error', error)
	}
}


export default createReducer(initialState, actionHandlers)