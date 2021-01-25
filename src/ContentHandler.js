import util from "quick-n-dirty-utils"

class ContentHandler {
    constructor(apiPrefix = "/api/content") {
        this.apiPrefix = apiPrefix
    }

    getContentList(reference = null, contentType = null) {
        const query = {}
        if (reference != null) {
            query.references = reference
        }
        if (contentType != null) {
            query.contentType = contentType
        }

        let url = this.apiPrefix
        if (query != null && Object.keys(query).length > 0) {
            url = `${url}?${Object.keys(query).map(key => key + '=' + query[key]).join('&')}`
        }

        return fetch(url, {
            headers: util.getAuthJsonHeader(),
        }).then(util.restHandler)
    }

    getContent(contentId) {
        return fetch(`${this.apiPrefix}/${contentId}`, {
            headers: util.getAuthJsonHeader(),
        }).then(util.restHandler)
    }
}

export default ContentHandler
