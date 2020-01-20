import Dispatcher from "../flux/dispatcher";
import { EventEmitter } from 'events';
import Constants from "../_constants/app.constants";
import Api from "../_dummyApis/comments.API";

let _store = {
    comments: [],
    totalCount: 0,
    filter: 'latest',
    limit: 10,
    page: 0
};

/**
 * Comment Store
 * @author Sai Krishnan S <xicoder96@github.com>
 * @class CommentStore
 * @extends {EventEmitter}
 */
class CommentStore extends EventEmitter {
    constructor() {
        super();
        this.isLoading = false;
        this._postId = "";
        this.hasError = false;
        this.error = null;
        this.registerToActions = this.registerToActions.bind(this);
        this.dispatchToken = Dispatcher.register(this.registerToActions.bind(this));
    }

    getComments() {
        return _store.comments;
    }

    getFilter() {
        return _store.filter;
    }

    getLimit() {
        return _store.limit;
    }

    getPage() {
        return _store.page;
    }

    getTotalCount() {
        return _store.totalCount;
    }

    fetchComments(postId) {
        console.log("inside fetch id", postId)
        this._postId = postId;
        let data = Api.fetchComments({ postId, filter: _store.filter, limit: _store.limit, offset: _store.page })
        console.log(data)
        _store.comments = data.comments;
        _store.totalCount = data.comments_count;
        this.emit(Constants.CHANGE);
    }

    upvoteComment(id) {
        let response = Api.updateUpvote(id)
        if (response.status === false) {
            this.error = response.data;
        }
        this.emit(Constants.CHANGE);
    }

    addComment(data) {
        let response = Api.createComment(data)
        if (response.status === false) {
            this.hasError = true;
            this.error = response.data;
        }
        this.emit(Constants.CHANGE);
    }

    changeLimit(limit) {
        _store.limit = limit;
        this.emit(Constants.CHANGE);
    }

    changePage(page) {
        _store.page = page;
        this.emit(Constants.CHANGE);
    }

    addChangeListener(callback) {
        this.on(Constants.CHANGE, callback);
        console.log("Comment store listeners:", this.listenerCount(Constants.CHANGE))
    }

    removeChangeListener(callback) {
        this.removeListener(Constants.CHANGE, callback);
        console.log("Comment store listeners:", this.listenerCount(Constants.CHANGE))
    }

    registerToActions(payload) {
        switch (payload.actionType) {
            case Constants.FETCH_COMMENTS:
                this.fetchComments(payload.postId);
                break;
            case Constants.ADD_COMMENT:
                this.addComment(payload.data);
                break;
            case Constants.CHANGE_COMMENTS_PER_PAGE:
                this.changeLimit(payload.limit);
                break;
            case Constants.PAGENATE_COMMENT:
                this.changePage(payload.page);
                break;
            case Constants.UPVOTE_COMMENT:
                this.upvoteComment(payload.id);
                break;
            default:
                return;
        }
    }
}
export default new CommentStore();