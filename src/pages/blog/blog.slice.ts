import { createAsyncThunk, createSlice, current, nanoid, PayloadAction } from '@reduxjs/toolkit'
import http from 'utils/http'
import { Post } from '../../@types/blog.type'
import { initialPostList } from '../../constants/blog'

interface BlogState {
    postList: Post[]
    editingPost: Post | null
}

// tạo store state cho Blog
const initialState: BlogState = {
    postList: [],
    editingPost: null
}

// tạo các action
// dùng createAsyncthunk để xử lý bất đồng bộ
export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkApi) => {
    const response = await http.get<Post[]>('posts', {
        signal: thunkApi.signal // loại bỏ 2 lần call api của trick mode => chỉ còn 1 lần call api
    })

    return response.data
})
export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkApi) => {
    const response = await http.post<Post>('posts', body, {
        signal: thunkApi.signal // loại bỏ 2 lần call api của trick mode => chỉ còn 1 lần call api
    })

    return response.data
})
export const updatePost = createAsyncThunk(
    'blog/updatePost',
    async ({ postId, body }: { postId: string; body: Post }, thunkApi) => {
        const response = await http.put<Post>(`posts/${postId}`, body, {
            signal: thunkApi.signal // loại bỏ 2 lần call api của trick mode => chỉ còn 1 lần call api
        })

        return response.data
    }
)
export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkApi) => {
    const response = await http.delete<Post>(`posts/${postId}`, {
        signal: thunkApi.signal // loại bỏ 2 lần call api của trick mode => chỉ còn 1 lần call api
    })

    return response.data
})

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    // map object
    // reducers chỉ sử lý đồng bộ
    reducers: {
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
        }
    },
    // builder callback
    extraReducers(builder) {
        builder
            .addCase(getPostList.fulfilled, (state, action) => {
                state.postList = action.payload
            })
            .addCase(addPost.fulfilled, (state, action) => {
                state.postList.push(action.payload)
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.postList.find((post, index) => {
                    if (post.id === action.payload.id) {
                        state.postList[index] = action.payload
                        return true
                    }
                    return false
                })
                state.editingPost = null
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                const postId = action.meta.arg // là thằng Id tham số đầu tiên truyền vào
                const deletePostIndex = state.postList.findIndex(post => post.id === postId)

                if (deletePostIndex !== -1) {
                    state.postList.splice(deletePostIndex, 1)
                }
            })
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

export const { cancelEditingPost, startEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer

export default blogReducer
