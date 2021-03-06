import createReducer from 'Application/utils/create-reducer'
import { 
	FETCH_WALL_VOTE_LIST,
	SAVE_WALL_VOTE,
	UPDATE_WALL_VOTE,
	DELETE_WALL_VOTE
} from 'wechatWall/constants'
import Immutable from 'immutable'

const initialState = Immutable.fromJS({
	content: []
})

const actionHandlers = {
	[FETCH_WALL_VOTE_LIST]: (state, { response }) => {
		return state.set('content', Immutable.fromJS(response.result.list))
	},

	[SAVE_WALL_VOTE]: (state, { response }) => {
		return state.update('content', x => x.unshift(Immutable.fromJS(response.result)))
	},

	[UPDATE_WALL_VOTE]: (state, { response, id }) => {
		return state.update('content', x => x.map(item => {
			if (item.get('id') == id) {
				return Immutable.fromJS(response.result)
			}
			return item
		}))
	},

	[DELETE_WALL_VOTE]: (state, { id }) => {
		return state.update('content', x => x.filter(item => item.get('id') != id))
	},

	['xxx']:  (state, { error }) => {
		return state.set('pending', false)
					.set('error', error)
	}
}


export default createReducer(initialState, actionHandlers)