import { createAction, createReducer, current } from '@reduxjs/toolkit'
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

// tạo actions
export const addPost = createAction<Post>('blog/addPost') // truyền vào Post -> {}
export const deletePost = createAction<String>('blog/deletePost') // truyền vào id -> string
export const startEditingPost = createAction<String>('blog/startEditingPost') // truyền vào id -> string
export const cancelEditingPost = createAction('blog/cancelEditingPost') // truyền vào id -> string
export const finishEditingPost = createAction<Post>('blog/finishEditingPost') //  truyền vào Post -> {}

// tạo reducer khi dispatch 1 action lên store
const blogReducer = createReducer(initialState, builder => {
    builder
        .addCase(addPost, (state, action) => {
            state.postList.push(action.payload)
        })
        .addCase(deletePost, (state, action) => {
            const postId = action.payload
            const foundPostIndex = state.postList.findIndex(post => post.id === postId)

            if (foundPostIndex !== -1) state.postList.splice(foundPostIndex, 1)
        })
        .addCase(startEditingPost, (state, action) => {
            const postId = action.payload
            const foundPost = state.postList.find(post => post.id === postId) || null
            state.editingPost = foundPost
        })
        .addCase(cancelEditingPost, state => {
            state.editingPost = null
        })
        .addCase(finishEditingPost, (state, action) => {
            const postId = action.payload.id
            state.postList.some((post, index) => {
                if (post.id === postId) {
                    state.postList[index] = action.payload
                    return true
                }

                return false
            })

            state.editingPost = null
        })
    // .addMatcher(
    //     action => action.type.includes('cancel'),
    //     (state, action) => {
    //         console.log(current(state))
    //     }
    // )
})

export default blogReducer
