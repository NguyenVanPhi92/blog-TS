import { createSlice, current, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { Post } from '../../@types/blog.type'
import { initialPostList } from '../../constants/blog'

interface BlogState {
    postList: Post[]
    editingPost: Post | null
}

// tạo store state cho Blog
const initialState: BlogState = {
    postList: initialPostList,
    editingPost: null
}

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    // map object
    reducers: {
        deletePost: (state, action: PayloadAction<string>) => {
            const postId = action.payload
            const foundPostIndex = state.postList.findIndex(post => post.id === postId)

            if (foundPostIndex !== -1) state.postList.splice(foundPostIndex, 1)
        },

        startEditingPost: (state, action: PayloadAction<string>) => {
            const postId = action.payload
            const foundPost = state.postList.find(post => post.id === postId) || null
            state.editingPost = foundPost
        },

        cancelEditingPost: state => {
            state.editingPost = null
        },

        finishEditingPost: (state, action: PayloadAction<Post>) => {
            const postId = action.payload.id
            state.postList.some((post, index) => {
                if (post.id === postId) {
                    state.postList[index] = action.payload
                    return true
                }

                return false
            })

            state.editingPost = null
        },

        addPost: {
            reducer: (state, action: PayloadAction<Post>) => {
                state.postList.push(action.payload)
            },
            prepare: (post: Omit<Post, 'id'>) => ({
                payload: {
                    ...post,
                    id: nanoid()
                }
            })
        }
    },
    // builder callback
    extraReducers(builder) {
        builder
            .addMatcher(
                // sự kiện nào có cancel thì log state ra
                action => action.type.includes('cancel'),
                (state, action) => {
                    console.log(current(state))
                }
            )
            // trường hợp không nhảy vào các action ở trên thì nhảy vào default case
            .addDefaultCase((state, action) => {
                console.log('action type: ', action.type, current(state))
            })
    }
})

export const { addPost, cancelEditingPost, deletePost, finishEditingPost, startEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer

export default blogReducer
