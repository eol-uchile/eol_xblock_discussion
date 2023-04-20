var limitCharacter = 2000;
var startForum = '';
var finishForum = '';
var is_staff = false;
var is_dated = false;
function check_dates(){
    if(is_dated){
        var s = new Date(startForum);
        var f = new Date(finishForum);
        var now = new Date();
        if (now >= s && now <= f) return true;
        else return false;
    }
    else return true;
}
(function () {
    var MathJaxProcessor;
    MathJaxProcessor = (function () {
        var CODESPAN, MATHSPLIT;
        MATHSPLIT = /(\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;
        CODESPAN = /(^|[^\\])(`+)([^\n]*?[^`\n])\2(?!`)/gm;
        function MathJaxProcessor(inlineMark, displayMark) {
            this.inlineMark = inlineMark || "$";
            this.displayMark = displayMark || "$$";
            this.math = null;
            this.blocks = null;
        }
        MathJaxProcessor.prototype.processMath = function (start, last, preProcess) {
            var block, i, j, ref, ref1;
            block = this.blocks
                .slice(start, last + 1)
                .join("")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            if (MathJax.Hub.Browser.isMSIE) {
                block = block.replace(/(%[^\n]*)\n/g, "$1<br/>\n");
            }
            for (i = j = ref = start + 1, ref1 = last; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
                this.blocks[i] = "";
            }
            this.blocks[start] = "@@" + this.math.length + "@@";
            if (preProcess) {
                block = preProcess(block);
            }
            return this.math.push(block);
        };
        MathJaxProcessor.prototype.removeMath = function (text) {
            var block, braces, current, deTilde, end, hasCodeSpans, j, last, ref, start;
            text = text || "";
            this.math = [];
            start = end = last = null;
            braces = 0;
            hasCodeSpans = /`/.test(text);
            if (hasCodeSpans) {
                text = text.replace(/~/g, "~T").replace(CODESPAN, function ($0) {
                    return $0.replace(/\$/g, "~D");
                });
                deTilde = function (text) {
                    return text.replace(/~([TD])/g, function ($0, $1) {
                        return { T: "~", D: "$" }[$1];
                    });
                };
            } else {
                deTilde = function (text) {
                    return text;
                };
            }
            this.blocks = _split(text.replace(/\r\n?/g, "\n"), MATHSPLIT);
            for (current = j = 1, ref = this.blocks.length; j < ref; current = j += 2) {
                block = this.blocks[current];
                if (block.charAt(0) === "@") {
                    this.blocks[current] = "@@" + this.math.length + "@@";
                    this.math.push(block);
                } else if (start) {
                    if (block === end) {
                        if (braces) {
                            last = current;
                        } else {
                            this.processMath(start, current, deTilde);
                            start = end = last = null;
                        }
                    } else if (block.match(/\n.*\n/)) {
                        if (last) {
                            current = last;
                            this.processMath(start, current, deTilde);
                        }
                        start = end = last = null;
                        braces = 0;
                    } else if (block === "{") {
                        ++braces;
                    } else if (block === "}" && braces) {
                        --braces;
                    }
                } else {
                    if (block === this.inlineMark || block === this.displayMark) {
                        start = current;
                        end = block;
                        braces = 0;
                    } else if (block.substr(1, 5) === "begin") {
                        start = current;
                        end = "\\end" + block.substr(6);
                        braces = 0;
                    }
                }
            }
            if (last) {
                this.processMath(start, last, deTilde);
                start = end = last = null;
            }
            return deTilde(this.blocks.join(""));
        };
        MathJaxProcessor.removeMathWrapper = function (_this) {
            return function (text) {
                return _this.removeMath(text);
            };
        };
        MathJaxProcessor.prototype.replaceMath = function (text) {
            text = text.replace(
                /@@(\d+)@@/g,
                (function (_this) {
                    return function ($0, $1) {
                        return _this.math[$1];
                    };
                })(this)
            );
            this.math = null;
            return text;
        };
        MathJaxProcessor.replaceMathWrapper = function (_this) {
            return function (text) {
                return _this.replaceMath(text);
            };
        };
        return MathJaxProcessor;
    })();
    if (typeof Markdown !== "undefined" && Markdown !== null) {
        Markdown.getMathCompatibleConverter = function (postProcessor) {
            var converter, processor;
            postProcessor ||
                (postProcessor = function (text) {
                    return text;
                });
            converter = Markdown.getSanitizingConverter();
            if (typeof MathJax !== "undefined" && MathJax !== null) {
                processor = new MathJaxProcessor();
                converter.hooks.chain("preConversion", MathJaxProcessor.removeMathWrapper(processor));
                converter.hooks.chain("postConversion", function (text) {
                    return postProcessor(MathJaxProcessor.replaceMathWrapper(processor)(text));
                });
            }
            return converter;
        };
        Markdown.makeWmdEditor = function (elem, appended_id, imageUploadUrl, postProcessor) {
            var $elem, $wmdPanel, $wmdPreviewContainer, _append, ajaxFileUpload, converter, delayRenderer, editor, imageUploadHandler, initialText, wmdInputId;
            $elem = $(elem);
            if (!$elem.length) {
                console.log("warning: elem for makeWmdEditor doesn't exist");
                return;
            }
            if (!$elem.find(".wmd-panel").length) {
                initialText = $elem.html();
                $elem.empty();
                _append = appended_id || "";
                wmdInputId = "wmd-input" + _append;
                $wmdPreviewContainer = $("<div>")
                    .addClass("wmd-preview-container")
                    .attr("role", "region")
                    .attr("aria-label", gettext("HTML preview of post"))
                    .append($("<div>").addClass("wmd-preview-label").text(gettext("Preview")))
                    .append(
                        $("<div>")
                            .attr("id", "wmd-preview" + _append)
                            .addClass("wmd-panel wmd-preview")
                    );
                $wmdPanel = $("<div>")
                    .addClass("wmd-panel")
                    .append($("<div>").addClass("wmd-button-bar" + _append))
                    .append($("<label>").addClass("sr").attr("for", wmdInputId).text(gettext("Tu pregunta o idea (requerido)")))
                    .append($("<textarea>").addClass("wmd-input").addClass("eol-text-limit").attr("id", wmdInputId).attr("maxlength", limitCharacter).html(initialText))
                    .append($wmdPreviewContainer);
                $elem.append($wmdPanel);
            }
            converter = Markdown.getMathCompatibleConverter(postProcessor);
            ajaxFileUpload = function (imageUploadUrl, input, startUploadHandler) {
                $("#loading")
                    .ajaxStart(function () {
                        return $(this).show();
                    })
                    .ajaxComplete(function () {
                        return $(this).hide();
                    });
                $("#upload")
                    .ajaxStart(function () {
                        return $(this).hide();
                    })
                    .ajaxComplete(function () {
                        return $(this).show();
                    });
                return $.ajaxFileUpload({
                    url: imageUploadUrl,
                    secureuri: false,
                    fileElementId: "file-upload",
                    dataType: "json",
                    success: function (data, status) {
                        var error, fileURL;
                        fileURL = data["result"]["file_url"];
                        error = data["result"]["error"];
                        if (error !== "") {
                            alert(error);
                            if (startUploadHandler) {
                                $("#file-upload").unbind("change").change(startUploadHandler);
                            }
                            return console.log(error);
                        } else {
                            return $(input).attr("value", fileURL);
                        }
                    },
                    error: function (data, status, e) {
                        alert(e);
                        if (startUploadHandler) {
                            return $("#file-upload").unbind("change").change(startUploadHandler);
                        }
                    },
                });
            };
            imageUploadHandler = function (elem, input) {
                return ajaxFileUpload(imageUploadUrl, input, imageUploadHandler);
            };
            editor = new Markdown.Editor(converter, appended_id, null, imageUploadHandler);
            delayRenderer = new MathJaxDelayRenderer();
            editor.hooks.chain("onPreviewPush", function (text, previewSet) {
                return delayRenderer.render({ text: text, previewSetter: previewSet });
            });
            editor.run();
            return editor;
        };
    }
}.call(this));
(function () {
    $(function () {
        var isMPInstalled;
        if (window.navigator.appName === "Microsoft Internet Explorer") {
            isMPInstalled = function (boolean) {
                var e, oMP;
                try {
                    oMP = new ActiveXObject("MathPlayer.Factory.1");
                    return true;
                } catch (_error) {
                    e = _error;
                    return false;
                }
            };
            if (typeof MathJax !== "undefined" && MathJax !== null && !isMPInstalled()) {
                $("#mathjax-accessibility-message").attr("aria-hidden", "false");
            }
            if (typeof MathJax !== "undefined" && MathJax !== null && $("#mathplayer-browser-message").length > 0) {
                return $("#mathplayer-browser-message").attr("aria-hidden", "false");
            } else {
                return $("#mathjax-accessibility-message").attr("aria-hidden", "true");
            }
        }
    });
}.call(this));
(function () {
    var getTime;
    getTime = function () {
        return new Date().getTime();
    };
    this.MathJaxDelayRenderer = (function () {
        var bufferId, numBuffers;
        MathJaxDelayRenderer.prototype.maxDelay = 3e3;
        MathJaxDelayRenderer.prototype.mathjaxRunning = false;
        MathJaxDelayRenderer.prototype.elapsedTime = 0;
        MathJaxDelayRenderer.prototype.mathjaxDelay = 0;
        MathJaxDelayRenderer.prototype.mathjaxTimeout = void 0;
        bufferId = "mathjax_delay_buffer";
        numBuffers = 0;
        function MathJaxDelayRenderer(params) {
            params = params || {};
            this.maxDelay = params["maxDelay"] || this.maxDelay;
            this.bufferId = params["bufferId"] || bufferId + numBuffers;
            numBuffers += 1;
            this.$buffer = $("<div>").attr("id", this.bufferId).css("display", "none").appendTo($("body"));
        }
        MathJaxDelayRenderer.prototype.render = function (params) {
            var delay, elem, preprocessor, previewSetter, renderer, text;
            elem = params["element"];
            previewSetter = params["previewSetter"];
            text = params["text"];
            if (text == null) {
                text = $(elem).html();
            }
            preprocessor = params["preprocessor"];
            if (params["delay"] === false) {
                if (preprocessor != null) {
                    text = preprocessor(text);
                }
                $(elem).html(text);
                return MathJax.Hub.Queue(["Typeset", MathJax.Hub, $(elem).attr("id")]);
            } else {
                if (this.mathjaxTimeout) {
                    window.clearTimeout(this.mathjaxTimeout);
                    this.mathjaxTimeout = void 0;
                }
                delay = Math.min(this.elapsedTime + this.mathjaxDelay, this.maxDelay);
                renderer = (function (_this) {
                    return function () {
                        var curTime, prevTime;
                        if (_this.mathjaxRunning) {
                            return;
                        }
                        prevTime = getTime();
                        if (preprocessor != null) {
                            text = preprocessor(text);
                        }
                        _this.$buffer.html(text);
                        curTime = getTime();
                        _this.elapsedTime = curTime - prevTime;
                        if (typeof MathJax !== "undefined" && MathJax !== null) {
                            prevTime = getTime();
                            _this.mathjaxRunning = true;
                            return MathJax.Hub.Queue(["Typeset", MathJax.Hub, _this.$buffer.attr("id")], function () {
                                _this.mathjaxRunning = false;
                                curTime = getTime();
                                _this.mathjaxDelay = curTime - prevTime;
                                if (previewSetter) {
                                    return previewSetter($(_this.$buffer).html());
                                } else {
                                    return $(elem).html($(_this.$buffer).html());
                                }
                            });
                        } else {
                            return (_this.mathjaxDelay = 0);
                        }
                    };
                })(this);
                return (this.mathjaxTimeout = window.setTimeout(renderer, delay));
            }
        };
        return MathJaxDelayRenderer;
    })();
}.call(this));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty;
    function __extends(child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }
    var __indexOf =
        [].indexOf ||
        function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) {
                    return i;
                }
            }
            return -1;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.Content = (function (_super) {
            __extends(Content, _super);
            function Content() {
                return Content.__super__.constructor.apply(this, arguments);
            }
            Content.contents = {};
            Content.contentInfos = {};
            Content.prototype.template = function () {
                return DiscussionUtil.getTemplate("_content");
            };
            Content.prototype.actions = { editable: ".admin-edit", can_reply: ".discussion-reply", can_delete: ".admin-delete", can_openclose: ".admin-openclose", can_report: ".admin-report", can_vote: ".admin-vote" };
            Content.prototype.urlMappers = {};
            Content.prototype.urlFor = function (name) {
                return this.urlMappers[name].apply(this);
            };
            Content.prototype.can = function (action) {
                return (this.get("ability") || {})[action];
            };
            Content.prototype.canBeEndorsed = function () {
                return false;
            };
            Content.prototype.updateInfo = function (info) {
                if (info) {
                    this.set("ability", info.ability);
                    this.set("voted", info.voted);
                    return this.set("subscribed", info.subscribed);
                }
            };
            Content.prototype.addComment = function (comment, options) {
                var comments_count, model, thread;
                options = options || {};
                if (!options.silent) {
                    thread = this.get("thread");
                    comments_count = parseInt(thread.get("comments_count"));
                    thread.set("comments_count", comments_count + 1);
                }
                this.get("children").push(comment);
                model = new Comment($.extend({}, comment, { thread: this.get("thread") }));
                this.get("comments").add(model);
                this.trigger("comment:add");
                return model;
            };
            Content.prototype.removeComment = function (comment) {
                var comments_count, thread;
                thread = this.get("thread");
                comments_count = parseInt(thread.get("comments_count"));
                thread.set("comments_count", comments_count - 1 - comment.getCommentsCount());
                return this.trigger("comment:remove");
            };
            Content.prototype.resetComments = function (children) {
                var comment, _i, _len, _ref, _results;
                this.set("children", []);
                this.set("comments", new Comments());
                _ref = children || [];
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    comment = _ref[_i];
                    _results.push(this.addComment(comment, { silent: true }));
                }
                return _results;
            };
            Content.prototype.initialize = function () {
                var userId;
                Content.addContent(this.id, this);
                userId = this.get("user_id");
                if (userId) {
                    this.set("staff_authored", DiscussionUtil.isStaff(userId));
                    this.set("community_ta_authored", DiscussionUtil.isTA(userId) || DiscussionUtil.isGroupTA(userId));
                } else {
                    this.set("staff_authored", false);
                    this.set("community_ta_authored", false);
                }
                if (Content.getInfo(this.id)) {
                    this.updateInfo(Content.getInfo(this.id));
                }
                this.set("user_url", DiscussionUtil.urlFor("user_profile", userId));
                return this.resetComments(this.get("children"));
            };
            Content.prototype.remove = function () {
                if (this.get("type") === "comment") {
                    this.get("thread").removeComment(this);
                    return this.get("thread").trigger("comment:remove", this);
                } else {
                    return this.trigger("thread:remove", this);
                }
            };
            Content.addContent = function (id, content) {
                this.contents[id] = content;
            };
            Content.getContent = function (id) {
                return this.contents[id];
            };
            Content.getInfo = function (id) {
                return this.contentInfos[id];
            };
            Content.loadContentInfos = function (infos) {
                var id, info;
                for (id in infos) {
                    if (infos.hasOwnProperty(id)) {
                        info = infos[id];
                        if (this.getContent(id)) {
                            this.getContent(id).updateInfo(info);
                        }
                    }
                }
                return $.extend(this.contentInfos, infos);
            };
            Content.prototype.pinThread = function () {
                var pinned;
                pinned = this.get("pinned");
                this.set("pinned", pinned);
                return this.trigger("change", this);
            };
            Content.prototype.unPinThread = function () {
                var pinned;
                pinned = this.get("pinned");
                this.set("pinned", pinned);
                return this.trigger("change", this);
            };
            Content.prototype.flagAbuse = function () {
                var temp_array;
                temp_array = this.get("abuse_flaggers");
                temp_array.push(window.user.get("id"));
                this.set("abuse_flaggers", temp_array);
                return this.trigger("change", this);
            };
            Content.prototype.unflagAbuse = function () {
                this.get("abuse_flaggers").pop(window.user.get("id"));
                return this.trigger("change", this);
            };
            Content.prototype.isFlagged = function () {
                var flaggers, user;
                user = DiscussionUtil.getUser();
                flaggers = this.get("abuse_flaggers");
                return user && (__indexOf.call(flaggers, user.id) >= 0 || (DiscussionUtil.isPrivilegedUser(user.id) && flaggers.length > 0));
            };
            Content.prototype.incrementVote = function (increment) {
                var newVotes;
                newVotes = _.clone(this.get("votes"));
                newVotes.up_count = newVotes.up_count + increment;
                return this.set("votes", newVotes);
            };
            Content.prototype.vote = function () {
                return this.incrementVote(1);
            };
            Content.prototype.unvote = function () {
                return this.incrementVote(-1);
            };
            return Content;
        })(Backbone.Model);
        this.Thread = (function (_super) {
            __extends(Thread, _super);
            function Thread() {
                return Thread.__super__.constructor.apply(this, arguments);
            }
            Thread.prototype.urlMappers = {
                retrieve: function () {
                    return DiscussionUtil.urlFor("retrieve_single_thread", this.get("commentable_id"), this.id);
                },
                reply: function () {
                    return DiscussionUtil.urlFor("create_comment", this.id);
                },
                unvote: function () {
                    return DiscussionUtil.urlFor("undo_vote_for_" + this.get("type"), this.id);
                },
                upvote: function () {
                    return DiscussionUtil.urlFor("upvote_" + this.get("type"), this.id);
                },
                downvote: function () {
                    return DiscussionUtil.urlFor("downvote_" + this.get("type"), this.id);
                },
                close: function () {
                    return DiscussionUtil.urlFor("openclose_thread", this.id);
                },
                update: function () {
                    return DiscussionUtil.urlFor("update_thread", this.id);
                },
                _delete: function () {
                    return DiscussionUtil.urlFor("delete_thread", this.id);
                },
                follow: function () {
                    return DiscussionUtil.urlFor("follow_thread", this.id);
                },
                unfollow: function () {
                    return DiscussionUtil.urlFor("unfollow_thread", this.id);
                },
                flagAbuse: function () {
                    return DiscussionUtil.urlFor("flagAbuse_" + this.get("type"), this.id);
                },
                unFlagAbuse: function () {
                    return DiscussionUtil.urlFor("unFlagAbuse_" + this.get("type"), this.id);
                },
                pinThread: function () {
                    return DiscussionUtil.urlFor("pin_thread", this.id);
                },
                unPinThread: function () {
                    return DiscussionUtil.urlFor("un_pin_thread", this.id);
                },
            };
            Thread.prototype.initialize = function () {
                this.set("thread", this);
                return Thread.__super__.initialize.call(this);
            };
            Thread.prototype.comment = function () {
                return this.set("comments_count", parseInt(this.get("comments_count")) + 1);
            };
            Thread.prototype.follow = function () {
                return this.set("subscribed", true);
            };
            Thread.prototype.unfollow = function () {
                return this.set("subscribed", false);
            };
            Thread.prototype.display_body = function () {
                if (this.has("highlighted_body")) {
                    return String(this.get("highlighted_body"))
                        .replace(/<highlight>/g, "<mark>")
                        .replace(/<\/highlight>/g, "</mark>");
                } else {
                    return this.get("body");
                }
            };
            Thread.prototype.display_title = function () {
                if (this.has("highlighted_title")) {
                    return String(this.get("highlighted_title"))
                        .replace(/<highlight>/g, "<mark>")
                        .replace(/<\/highlight>/g, "</mark>");
                } else {
                    return this.get("title");
                }
            };
            Thread.prototype.toJSON = function () {
                var json_attributes;
                json_attributes = _.clone(this.attributes);
                return _.extend(json_attributes, { title: this.display_title(), body: this.display_body() });
            };
            Thread.prototype.created_at_date = function () {
                return new Date(this.get("created_at"));
            };
            Thread.prototype.created_at_time = function () {
                return new Date(this.get("created_at")).getTime();
            };
            Thread.prototype.hasResponses = function () {
                return this.get("comments_count") > 0;
            };
            return Thread;
        })(this.Content);
        this.Comment = (function (_super) {
            __extends(Comment, _super);
            function Comment() {
                var self = this;
                this.canBeEndorsed = function () {
                    return Comment.prototype.canBeEndorsed.apply(self, arguments);
                };
                return Comment.__super__.constructor.apply(this, arguments);
            }
            Comment.prototype.urlMappers = {
                reply: function () {
                    return DiscussionUtil.urlFor("create_sub_comment", this.id);
                },
                unvote: function () {
                    return DiscussionUtil.urlFor("undo_vote_for_" + this.get("type"), this.id);
                },
                upvote: function () {
                    return DiscussionUtil.urlFor("upvote_" + this.get("type"), this.id);
                },
                downvote: function () {
                    return DiscussionUtil.urlFor("downvote_" + this.get("type"), this.id);
                },
                endorse: function () {
                    return DiscussionUtil.urlFor("endorse_comment", this.id);
                },
                update: function () {
                    return DiscussionUtil.urlFor("update_comment", this.id);
                },
                _delete: function () {
                    return DiscussionUtil.urlFor("delete_comment", this.id);
                },
                flagAbuse: function () {
                    return DiscussionUtil.urlFor("flagAbuse_" + this.get("type"), this.id);
                },
                unFlagAbuse: function () {
                    return DiscussionUtil.urlFor("unFlagAbuse_" + this.get("type"), this.id);
                },
            };
            Comment.prototype.getCommentsCount = function () {
                var count;
                count = 0;
                this.get("comments").each(function (comment) {
                    return (count += comment.getCommentsCount() + 1);
                });
                return count;
            };
            Comment.prototype.canBeEndorsed = function () {
                var user_id;
                user_id = window.user.get("id");
                return user_id && (DiscussionUtil.isPrivilegedUser(user_id) || (this.get("thread").get("thread_type") === "question" && this.get("thread").get("user_id") === user_id));
            };
            return Comment;
        })(this.Content);
        this.Comments = (function (_super) {
            __extends(Comments, _super);
            function Comments() {
                return Comments.__super__.constructor.apply(this, arguments);
            }
            Comments.prototype.model = Comment;
            Comments.prototype.initialize = function () {
                var self = this;
                return this.bind("add", function (item) {
                    item.collection = self;
                });
            };
            Comments.prototype.find = function (id) {
                return _.first(this.where({ id: id }));
            };
            return Comments;
        })(Backbone.Collection);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.Discussion = (function (_super) {
            __extends(Discussion, _super);
            function Discussion() {
                return Discussion.__super__.constructor.apply(this, arguments);
            }
            Discussion.prototype.model = Thread;
            Discussion.prototype.initialize = function (models, options) {
                var self = this;
                if (!options) {
                    options = {};
                }
                this.pages = options.pages || 1;
                this.current_page = 1;
                this.sort_preference = options.sort;
                this.is_commentable_divided = options.is_commentable_divided;
                this.bind("add", function (item) {
                    item.discussion = self;
                });
                this.setSortComparator(this.sort_preference);
                return this.on("thread:remove", function (thread) {
                    self.remove(thread);
                });
            };
            Discussion.prototype.find = function (id) {
                return _.first(this.where({ id: id }));
            };
            Discussion.prototype.hasMorePages = function () {
                return this.current_page < this.pages;
            };
            Discussion.prototype.setSortComparator = function (sortBy) {
                switch (sortBy) {
                    case "activity":
                        this.comparator = this.sortByDateRecentFirst;
                        break;
                    case "votes":
                        this.comparator = this.sortByVotes;
                        break;
                    case "comments":
                        this.comparator = this.sortByComments;
                        break;
                }
            };
            Discussion.prototype.addThread = function (thread) {
                var model;
                if (!this.find(thread.id)) {
                    model = new Thread(thread);
                    this.add(model);
                    return model;
                }
            };
            Discussion.prototype.retrieveAnotherPage = function (mode, options, sort_options, error) {
                var data,
                    url,
                    self = this;
                if (!options) {
                    options = {};
                }
                if (!sort_options) {
                    sort_options = {};
                }
                data = { page: this.current_page + 1 };
                if (_.contains(["unread", "unanswered", "flagged"], options.filter)) {
                    data[options.filter] = true;
                }
                switch (mode) {
                    case "search":
                        url = DiscussionUtil.urlFor("search");
                        data.text = options.search_text;
                        break;
                    case "commentables":
                        url = DiscussionUtil.urlFor("retrieve_discussion", options.commentable_ids);
                        data.commentable_ids = options.commentable_ids;
                        break;
                    case "all":
                        url = DiscussionUtil.urlFor("threads");
                        break;
                    case "followed":
                        url = DiscussionUtil.urlFor("followed_threads", options.user_id);
                        break;
                    case "user":
                        url = DiscussionUtil.urlFor("user_profile", options.user_id);
                        break;
                }
                if (options.group_id) {
                    data.group_id = options.group_id;
                }
                data.sort_key = sort_options.sort_key || "activity";
                data.sort_order = sort_options.sort_order || "desc";
                return DiscussionUtil.safeAjax({
                    $elem: this.$el,
                    url: url,
                    data: data,
                    dataType: "json",
                    success: function (response) {
                        var models, new_collection, new_threads;
                        models = self.models;
                        new_threads = [
                            (function () {
                                var _i, _len, _ref, _results;
                                _ref = response.discussion_data;
                                _results = [];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    data = _ref[_i];
                                    _results.push(new Thread(data));
                                }
                                return _results;
                            })(),
                        ][0];
                        new_collection = _.union(models, new_threads);
                        Content.loadContentInfos(response.annotated_content_info);
                        self.pages = response.num_pages;
                        self.current_page = response.page;
                        self.is_commentable_divided = response.is_commentable_divided;
                        return self.reset(new_collection);
                    },
                    error: error,
                });
            };
            Discussion.prototype.sortByDate = function (thread) {
                return this.pinnedThreadsSortComparatorWithDate(thread, true);
            };
            Discussion.prototype.sortByDateRecentFirst = function (thread) {
                return this.pinnedThreadsSortComparatorWithDate(thread, false);
            };
            Discussion.prototype.sortByVotes = function (thread1, thread2) {
                var thread1_count, thread2_count;
                thread1_count = parseInt(thread1.get("votes").up_count);
                thread2_count = parseInt(thread2.get("votes").up_count);
                return this.pinnedThreadsSortComparatorWithCount(thread1, thread2, thread1_count, thread2_count);
            };
            Discussion.prototype.sortByComments = function (thread1, thread2) {
                var thread1_count, thread2_count;
                thread1_count = parseInt(thread1.get("comments_count"));
                thread2_count = parseInt(thread2.get("comments_count"));
                return this.pinnedThreadsSortComparatorWithCount(thread1, thread2, thread1_count, thread2_count);
            };
            Discussion.prototype.pinnedThreadsSortComparatorWithCount = function (thread1, thread2, thread1_count, thread2_count) {
                if (thread1.get("pinned") && !thread2.get("pinned")) {
                    return -1;
                } else if (thread2.get("pinned") && !thread1.get("pinned")) {
                    return 1;
                } else {
                    if (thread1_count > thread2_count) {
                        return -1;
                    } else if (thread2_count > thread1_count) {
                        return 1;
                    } else {
                        if (thread1.created_at_time() > thread2.created_at_time()) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                }
            };
            Discussion.prototype.pinnedThreadsSortComparatorWithDate = function (thread, ascending) {
                var preferredDate, threadLastActivityAtTime, today;
                threadLastActivityAtTime = new Date(thread.get("last_activity_at")).getTime();
                if (thread.get("pinned")) {
                    today = new Date();
                    preferredDate = new Date(today.getTime() + 24 * 60 * 60 * 1e3 + threadLastActivityAtTime);
                } else {
                    preferredDate = threadLastActivityAtTime;
                }
                if (ascending) {
                    return preferredDate;
                } else {
                    return -preferredDate;
                }
            };
            return Discussion;
        })(Backbone.Collection);
    }
}.call(window));
var disableFastPreview = true,
    vendorScript;
if (typeof MathJax === "undefined") {
    if (disableFastPreview) {
        window.MathJax = { menuSettings: { CHTMLpreview: false } };
    }
    vendorScript = document.createElement("script");
    vendorScript.onload = function () {
        "use strict";
        var MathJax = window.MathJax,
            setMathJaxDisplayDivSettings;
        MathJax.Hub.Config({
            tex2jax: {
                inlineMath: [
                    ["\\(", "\\)"],
                    ["[mathjaxinline]", "[/mathjaxinline]"],
                ],
                displayMath: [
                    ["\\[", "\\]"],
                    ["[mathjax]", "[/mathjax]"],
                ],
            },
        });
        if (disableFastPreview) {
            MathJax.Hub.processSectionDelay = 0;
        }
        MathJax.Hub.signal.Interest(function (message) {
            if (message[0] === "End Math") {
                setMathJaxDisplayDivSettings();
            }
        });
        setMathJaxDisplayDivSettings = function () {
            $(".MathJax_Display").each(function () {
                this.setAttribute("tabindex", "0");
                this.setAttribute("aria-live", "off");
                this.removeAttribute("role");
                this.removeAttribute("aria-readonly");
            });
        };
    };
    window.MathJax = { menuSettings: { collapsible: true, autocollapse: false, explorer: true } };
    vendorScript.src = "https://cdn.jsdelivr.net/npm/mathjax@2.7.5/MathJax.js?config=TeX-MML-AM_HTMLorMML";
    document.body.appendChild(vendorScript);
}
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.DiscussionCourseSettings = (function (_super) {
            __extends(DiscussionCourseSettings, _super);
            function DiscussionCourseSettings() {
                return DiscussionCourseSettings.__super__.constructor.apply(this, arguments);
            }
            return DiscussionCourseSettings;
        })(Backbone.Model);
    }
}.call(this));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.DiscussionUser = (function (_super) {
            __extends(DiscussionUser, _super);
            function DiscussionUser() {
                return DiscussionUser.__super__.constructor.apply(this, arguments);
            }
            DiscussionUser.prototype.following = function (thread) {
                return _.include(this.get("subscribed_thread_ids"), thread.id);
            };
            DiscussionUser.prototype.voted = function (thread) {
                return _.include(this.get("upvoted_ids"), thread.id);
            };
            DiscussionUser.prototype.vote = function (thread) {
                this.get("upvoted_ids").push(thread.id);
                return thread.vote();
            };
            DiscussionUser.prototype.unvote = function (thread) {
                this.set("upvoted_ids", _.without(this.get("upvoted_ids"), thread.id));
                return thread.unvote();
            };
            return DiscussionUser;
        })(Backbone.Model);
    }
}.call(this));
(function () {
    "use strict";
    this.DiscussionUtil = function () {
        function DiscussionUtil() {}
        DiscussionUtil.wmdEditors = {};
        DiscussionUtil.leftKey = 37;
        DiscussionUtil.rightKey = 39;
        DiscussionUtil.getTemplate = function (id) {
            return $("script#" + id).html();
        };
        DiscussionUtil.setUser = function (user) {
            this.user = user;
        };
        DiscussionUtil.getUser = function () {
            return this.user;
        };
        DiscussionUtil.loadRoles = function (roles) {
            this.roleIds = roles;
        };
        DiscussionUtil.isStaff = function (userId) {
            var staff;
            if (_.isUndefined(userId)) {
                userId = this.user ? this.user.id : void 0;
            }
            if (_.isUndefined(this.roleIds)) {
                this.roleIds = {};
            }
            staff = _.union(this.roleIds.Moderator, this.roleIds.Administrator);
            return _.include(staff, parseInt(userId));
        };
        DiscussionUtil.isTA = function (userId) {
            var ta;
            if (_.isUndefined(userId)) {
                userId = this.user ? this.user.id : void 0;
            }
            ta = _.union(this.roleIds["Community TA"]);
            return _.include(ta, parseInt(userId));
        };
        DiscussionUtil.isGroupTA = function (userId) {
            var groupTa,
                localUserId = userId;
            if (_.isUndefined(userId)) {
                localUserId = this.user ? this.user.id : void 0;
            }
            groupTa = _.union(this.roleIds["Group Moderator"]);
            return _.include(groupTa, parseInt(localUserId, 10));
        };
        DiscussionUtil.isPrivilegedUser = function (userId) {
            return this.isStaff(userId) || this.isTA(userId);
        };
        DiscussionUtil.bulkUpdateContentInfo = function (infos) {
            var id, info, _results;
            _results = [];
            for (id in infos) {
                if (infos.hasOwnProperty(id)) {
                    info = infos[id];
                    _results.push(Content.getContent(id).updateInfo(info));
                }
            }
            return _results;
        };
        DiscussionUtil.generateDiscussionLink = function (cls, txt, handler) {
            return $("<a>")
                .addClass("discussion-link")
                .attr("href", "#")
                .addClass(cls)
                .text(txt)
                .click(function () {
                    return handler(this);
                });
        };
        DiscussionUtil.urlFor = function (name, param, param1, param2) {
            return {
                follow_discussion: "/courses/" + $$course_id + "/discussion/" + param + "/follow",
                unfollow_discussion: "/courses/" + $$course_id + "/discussion/" + param + "/unfollow",
                create_thread: "/courses/" + $$course_id + "/discussion/" + param + "/threads/create",
                update_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/update",
                create_comment: "/courses/" + $$course_id + "/discussion/threads/" + param + "/reply",
                delete_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/delete",
                flagAbuse_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/flagAbuse",
                unFlagAbuse_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/unFlagAbuse",
                flagAbuse_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/flagAbuse",
                unFlagAbuse_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/unFlagAbuse",
                upvote_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/upvote",
                downvote_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/downvote",
                pin_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/pin",
                un_pin_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/unpin",
                undo_vote_for_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/unvote",
                follow_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/follow",
                unfollow_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/unfollow",
                update_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/update",
                endorse_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/endorse",
                create_sub_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/reply",
                delete_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/delete",
                upvote_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/upvote",
                downvote_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/downvote",
                undo_vote_for_comment: "/courses/" + $$course_id + "/discussion/comments/" + param + "/unvote",
                upload: "/courses/" + $$course_id + "/discussion/upload",
                users: "/courses/" + $$course_id + "/discussion/users",
                search: "/courses/" + $$course_id + "/discussion/forum/search",
                retrieve_discussion: "/courses/" + $$course_id + "/discussion/forum/" + param + "/inline",
                retrieve_single_thread: "/courses/" + $$course_id + "/discussion/forum/" + param + "/threads/" + param1,
                openclose_thread: "/courses/" + $$course_id + "/discussion/threads/" + param + "/close",
                user_profile: "/courses/" + $$course_id + "/discussion/forum/users/" + param,
                followed_threads: "/courses/" + $$course_id + "/discussion/forum/users/" + param + "/followed",
                threads: "/courses/" + $$course_id + "/discussion/forum",
                enable_notifications: "/notification_prefs/enable/",
                disable_notifications: "/notification_prefs/disable/",
                notifications_status: "/notification_prefs/status/",
            }[name];
        };
        DiscussionUtil.ignoreEnterKey = function (event) {
            if (event.which === 13) {
                return event.preventDefault();
            }
        };
        DiscussionUtil.activateOnSpace = function (event, func) {
            if (event.which === 32) {
                event.preventDefault();
                return func(event);
            }
        };
        DiscussionUtil.makeFocusTrap = function (elem) {
            return elem.keydown(function (event) {
                if (event.which === 9) {
                    return event.preventDefault();
                }
            });
        };
        DiscussionUtil.showLoadingIndicator = function (element, takeFocus) {
            var animElem = edx.HtmlUtils.joinHtml(
                edx.HtmlUtils.HTML("<div class='loading-animation' tabindex='0'>"),
                edx.HtmlUtils.HTML("<span class='icon fa fa-spinner' aria-hidden='true'></span><span class='sr'>"),
                gettext("Loading content"),
                edx.HtmlUtils.HTML("</span></div>")
            );
            var $animElem = $(animElem.toString());
            element.after($animElem);
            this.$_loading = $animElem;
            if (takeFocus) {
                this.makeFocusTrap(this.$_loading);
                this.$_loading.focus();
            }
        };
        DiscussionUtil.hideLoadingIndicator = function () {
            return this.$_loading.remove();
        };
        DiscussionUtil.discussionAlert = function (header, body) {
            var $alertDiv, $alertTrigger;
            var popupTemplate = $("#alert-popup").html() || "";
            if ($("#discussion-alert").length === 0) {
                $alertDiv = $(edx.HtmlUtils.template(popupTemplate)({}).toString());
                this.makeFocusTrap($alertDiv.find("button"));
                $alertTrigger = $("<a href='#discussion-alert' id='discussion-alert-trigger'/>").css("display", "none");
                $alertTrigger.leanModal({ closeButton: "#discussion-alert .dismiss", overlay: 1, top: 200 });
                $("body").append($alertDiv).append($alertTrigger);
            }
            $("#discussion-alert header h2").text(header);
            $("#discussion-alert p").text(body);
            $("#discussion-alert-trigger").click();
            $("#discussion-alert button").focus();
        };
        DiscussionUtil.safeAjax = function (params) {
            var $elem,
                deferred,
                request,
                self = this;
            $elem = params.$elem;
            if ($elem && $elem.prop("disabled")) {
                deferred = $.Deferred();
                deferred.reject();
                return deferred.promise();
            }
            params.url = URI(params.url).addSearch({ ajax: 1 });
            if (!params.error) {
                params.error = function () {
                    self.discussionAlert(gettext("Error"), gettext("Your request could not be processed. Refresh the page and try again."));
                };
            }
            if ($elem) {
                $elem.prop("disabled", true);
            }
            if (params.$loading) {
                if (params.loadingCallback) {
                    params.loadingCallback.apply(params.$loading);
                } else {
                    self.showLoadingIndicator(params.$loading, params.takeFocus);
                }
            }
            request = $.ajax(params).always(function () {
                if ($elem) {
                    $elem.prop("disabled", false);
                }
                if (params.$loading) {
                    if (params.loadedCallback) {
                        return params.loadedCallback.apply(params.$loading);
                    } else {
                        return self.hideLoadingIndicator();
                    }
                }
            });
            return request;
        };
        DiscussionUtil.updateWithUndo = function (model, updates, safeAjaxParams, errorMsg, beforeSend) {
            var undo,
                self = this;
            if (errorMsg) {
                safeAjaxParams.error = function () {
                    return self.discussionAlert(gettext("Error"), errorMsg);
                };
            }
            undo = _.pick(model.attributes, _.keys(updates));
            model.set(updates);
            if (typeof beforeSend === "function") {
                beforeSend();
            }
            return this.safeAjax(safeAjaxParams).fail(function () {
                return model.set(undo);
            });
        };
        DiscussionUtil.bindLocalEvents = function ($local, eventsHandler) {
            var event, eventSelector, handler, selector, _ref, _results;
            _results = [];
            for (eventSelector in eventsHandler) {
                if (eventsHandler.hasOwnProperty(eventSelector)) {
                    handler = eventsHandler[eventSelector];
                    _ref = eventSelector.split(" ");
                    event = _ref[0];
                    selector = _ref[1];
                    _results.push($local(selector).unbind(event)[event](handler));
                }
            }
            return _results;
        };
        DiscussionUtil.formErrorHandler = function (errorsField) {
            return function (xhr) {
                var makeErrorElem, response, i, $errorItem;
                makeErrorElem = function (message, alertId) {
                    return edx.HtmlUtils.joinHtml(edx.HtmlUtils.HTML("<li>"), edx.HtmlUtils.template($("#new-post-alert-template").html())({ message: message, alertId: alertId }), edx.HtmlUtils.HTML("</li>"));
                };
                errorsField.empty().show();
                if (xhr.status === 400) {
                    response = JSON.parse(xhr.responseText);
                    if (response.errors) {
                        for (i = 0; i < response.errors.length; i++) {
                            $errorItem = makeErrorElem(response.errors[i], i);
                            edx.HtmlUtils.append(errorsField, $errorItem);
                        }
                    }
                } else {
                    $errorItem = makeErrorElem("Your request could not be processed. Refresh the page and try again.", 0);
                    edx.HtmlUtils.append(errorsField, $errorItem);
                }
                $('div[role="alert"]', errorsField).first().focus();
            };
        };
        DiscussionUtil.clearFormErrors = function (errorsField) {
            return errorsField.empty();
        };
        DiscussionUtil.postMathJaxProcessor = function (htmlSnippet) {
            var RE_DISPLAYMATH, RE_INLINEMATH;
            RE_INLINEMATH = /^\$([^\$]*)\$/g;
            RE_DISPLAYMATH = /^\$\$([^\$]*)\$\$/g;
            return this.processEachMathAndCode(htmlSnippet, function (s, type) {
                if (type === "display") {
                    return s.replace(RE_DISPLAYMATH, function ($0, $1) {
                        return "\\[" + $1 + "\\]";
                    });
                } else if (type === "inline") {
                    return s.replace(RE_INLINEMATH, function ($0, $1) {
                        return "\\(" + $1 + "\\)";
                    });
                } else {
                    return s;
                }
            });
        };
        DiscussionUtil.makeWmdEditor = function ($content, $local, cls_identifier) {
            var appended_id, editor, elem, id, imageUploadUrl, placeholder, _processor;
            elem = $local("." + cls_identifier);
            placeholder = elem.data("placeholder");
            id = elem.data("id");
            appended_id = "-" + cls_identifier + "-" + id;
            imageUploadUrl = this.urlFor("upload");
            _processor = function (self) {
                return function (text) {
                    return self.postMathJaxProcessor(edx.HtmlUtils.HTML(text)).toString();
                };
            };
            editor = Markdown.makeWmdEditor(elem, appended_id, imageUploadUrl, _processor(this));
            this.wmdEditors["" + cls_identifier + "-" + id] = editor;
            if (placeholder) {
                elem.find("#wmd-input" + appended_id).attr("placeholder", placeholder);
            }
            return editor;
        };
        DiscussionUtil.getWmdEditor = function ($content, $local, cls_identifier) {
            var elem, id;
            elem = $local("." + cls_identifier);
            id = elem.attr("data-id");
            return this.wmdEditors["" + cls_identifier + "-" + id];
        };
        DiscussionUtil.getWmdInput = function ($content, $local, cls_identifier) {
            var elem, id;
            elem = $local("." + cls_identifier);
            id = elem.attr("data-id");
            return $local("#wmd-input-" + cls_identifier + "-" + id);
        };
        DiscussionUtil.getWmdContent = function ($content, $local, cls_identifier) {
            return this.getWmdInput($content, $local, cls_identifier).val();
        };
        DiscussionUtil.setWmdContent = function ($content, $local, cls_identifier, text) {
            this.getWmdInput($content, $local, cls_identifier).val(text);
            return this.getWmdEditor($content, $local, cls_identifier).refreshPreview();
        };
        var RE_DISPLAYMATH = /^([^\$]*?)\$\$([^\$]*?)\$\$(.*)$/m,
            RE_INLINEMATH = /^([^\$]*?)\$([^\$]+?)\$(.*)$/m,
            ESCAPED_DOLLAR = "@@ESCAPED_D@@",
            ESCAPED_BACKSLASH = "@@ESCAPED_B@@";
        DiscussionUtil.processEachMathAndCode = function (htmlSnippet, processor) {
            var $div, codeArchive, processedHtmlString, htmlString;
            codeArchive = {};
            processedHtmlString = "";
            $div = edx.HtmlUtils.setHtml($("<div>"), edx.HtmlUtils.ensureHtml(htmlSnippet));
            $div.find("code").each(function (index, code) {
                codeArchive[index] = $(code).html();
                return $(code).text(index);
            });
            htmlString = $div.html();
            htmlString = htmlString.replace(/\\\$/g, ESCAPED_DOLLAR);
            while (true) {
                if (RE_INLINEMATH.test(htmlString)) {
                    htmlString = htmlString.replace(RE_INLINEMATH, function ($0, $1, $2, $3) {
                        processedHtmlString += $1 + processor("$" + $2 + "$", "inline");
                        return $3;
                    });
                } else if (RE_DISPLAYMATH.test(htmlString)) {
                    htmlString = htmlString.replace(RE_DISPLAYMATH, function ($0, $1, $2, $3) {
                        processedHtmlString += $1 + processor("$$" + $2 + "$$", "display");
                        return $3;
                    });
                } else {
                    processedHtmlString += htmlString;
                    break;
                }
            }
            htmlString = processedHtmlString;
            htmlString = htmlString.replace(new RegExp(ESCAPED_DOLLAR, "g"), "\\$");
            htmlString = htmlString.replace(/\\\\\\\\/g, ESCAPED_BACKSLASH);
            htmlString = htmlString.replace(/\\begin\{([a-z]*\*?)\}([\s\S]*?)\\end\{\1\}/gim, function ($0, $1, $2) {
                return processor("\\begin{" + $1 + "}" + $2 + ("\\end{" + $1 + "}"));
            });
            htmlString = htmlString.replace(new RegExp(ESCAPED_BACKSLASH, "g"), "\\\\\\\\");
            $div = edx.HtmlUtils.setHtml($("<div>"), edx.HtmlUtils.HTML(htmlString));
            $div.find("code").each(function (index, code) {
                edx.HtmlUtils.setHtml($(code), edx.HtmlUtils.HTML(processor(codeArchive[index], "code")));
            });
            return edx.HtmlUtils.HTML($div.html());
        };
        DiscussionUtil.unescapeHighlightTag = function (htmlSnippet) {
            return edx.HtmlUtils.HTML(
                htmlSnippet
                    .toString()
                    .replace(/\&lt\;highlight\&gt\;/g, "<span class='search-highlight'>")
                    .replace(/\&lt\;\/highlight\&gt\;/g, "</span>")
            );
        };
        DiscussionUtil.stripHighlight = function (htmlString) {
            return htmlString.replace(/\&(amp\;)?lt\;highlight\&(amp\;)?gt\;/g, "").replace(/\&(amp\;)?lt\;\/highlight\&(amp\;)?gt\;/g, "");
        };
        DiscussionUtil.stripLatexHighlight = function (htmlSnippet) {
            return this.processEachMathAndCode(htmlSnippet, this.stripHighlight);
        };
        DiscussionUtil.markdownWithHighlight = function (unsafeText) {
            var converter;
            unsafeText = unsafeText.replace(/^\&gt\;/gm, ">");
            converter = Markdown.getMathCompatibleConverter();
            var htmlSnippet = edx.HtmlUtils.HTML(converter.makeHtml(unsafeText));
            return this.unescapeHighlightTag(this.stripLatexHighlight(htmlSnippet));
        };
        DiscussionUtil.abbreviateString = function (text, minLength) {
            if (text.length < minLength) {
                return text;
            } else {
                while (minLength < text.length && text[minLength] !== " ") {
                    minLength++;
                }
                return text.substr(0, minLength) + gettext("…");
            }
        };
        DiscussionUtil.convertMath = function (element) {
            edx.HtmlUtils.setHtml(element, this.postMathJaxProcessor(this.markdownWithHighlight(element.text())));
        };
        DiscussionUtil.typesetMathJax = function (element) {
            if (typeof MathJax !== "undefined" && MathJax !== null && typeof MathJax.Hub !== "undefined") {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, element[0]]);
            }
        };
        DiscussionUtil.abbreviateHTML = function (htmlSnippet, maxLength) {
            var $result, imagesToReplace, truncated_text;
            truncated_text = edx.HtmlUtils.HTML(jQuery.truncate(htmlSnippet.toString(), { length: maxLength, noBreaks: true, ellipsis: gettext("…") }));
            $result = $(edx.HtmlUtils.joinHtml(edx.HtmlUtils.HTML("<div>"), truncated_text, edx.HtmlUtils.HTML("</div>")).toString());
            imagesToReplace = $result.find("img:not(:first)");
            if (imagesToReplace.length > 0) {
                edx.HtmlUtils.append($result, edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML("<p><em>{text}</em></p>"), { text: gettext("Some images in this post have been omitted") }));
            }
            var afterMessage = edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML("<em>{text}</em>"), { text: gettext("image omitted") });
            imagesToReplace.after(edx.HtmlUtils.ensureHtml(afterMessage).toString()).remove();
            return $result.html();
        };
        DiscussionUtil.getPaginationParams = function (curPage, numPages, pageUrlFunc) {
            var delta, maxPage, minPage, pageInfo;
            delta = 2;
            minPage = Math.max(curPage - delta, 1);
            maxPage = Math.min(curPage + delta, numPages);
            pageInfo = function (pageNum) {
                return { number: pageNum, url: pageUrlFunc(pageNum) };
            };
            return {
                page: curPage,
                lowPages: _.range(minPage, curPage).map(pageInfo),
                highPages: _.range(curPage + 1, maxPage + 1).map(pageInfo),
                previous: curPage > 1 ? pageInfo(curPage - 1) : null,
                next: curPage < numPages ? pageInfo(curPage + 1) : null,
                leftdots: minPage > 2,
                rightdots: maxPage < numPages - 1,
                first: minPage > 1 ? pageInfo(1) : null,
                last: maxPage < numPages ? pageInfo(numPages) : null,
            };
        };
        DiscussionUtil.handleKeypressInToolbar = function (event) {
            var $currentButton, $nextButton, $toolbar, $allButtons, keyPressed, nextIndex, currentButtonIndex, validKeyPress, toolbarHasButtons;
            $currentButton = $(event.target);
            keyPressed = event.which || event.keyCode;
            $toolbar = $currentButton.parent();
            $allButtons = $toolbar.children(".wmd-button");
            validKeyPress = keyPressed === this.leftKey || keyPressed === this.rightKey;
            toolbarHasButtons = $allButtons.length > 0;
            if (validKeyPress && toolbarHasButtons) {
                currentButtonIndex = $allButtons.index($currentButton);
                nextIndex = keyPressed === this.leftKey ? currentButtonIndex - 1 : currentButtonIndex + 1;
                nextIndex = Math.max(Math.min(nextIndex, $allButtons.length - 1), 0);
                $nextButton = $($allButtons[nextIndex]);
                this.moveSelectionToNextItem($currentButton, $nextButton);
            }
        };
        DiscussionUtil.moveSelectionToNextItem = function (prevItem, nextItem) {
            prevItem.attr("aria-selected", "false");
            prevItem.attr("tabindex", "-1");
            nextItem.attr("aria-selected", "true");
            nextItem.attr("tabindex", "0");
            nextItem.focus();
        };
        return DiscussionUtil;
    }.call(this);
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.DiscussionContentView = (function (_super) {
            __extends(DiscussionContentView, _super);
            function DiscussionContentView() {
                var self = this;
                this.setWmdContent = function () {
                    return DiscussionContentView.prototype.setWmdContent.apply(self, arguments);
                };
                this.getWmdContent = function () {
                    return DiscussionContentView.prototype.getWmdContent.apply(self, arguments);
                };
                this.getWmdEditor = function () {
                    return DiscussionContentView.prototype.getWmdEditor.apply(self, arguments);
                };
                this.makeWmdEditor = function () {
                    return DiscussionContentView.prototype.makeWmdEditor.apply(self, arguments);
                };
                return DiscussionContentView.__super__.constructor.apply(this, arguments);
            }
            DiscussionContentView.prototype.events = {
                "click .discussion-flag-abuse": "toggleFlagAbuse",
                "keydown .discussion-flag-abuse": function (event) {
                    return DiscussionUtil.activateOnSpace(event, this.toggleFlagAbuse);
                },
            };
            DiscussionContentView.prototype.attrRenderer = {
                ability: function (ability) {
                    var action, selector, _ref, _results;
                    _ref = this.abilityRenderer;
                    _results = [];
                    for (action in _ref) {
                        if (_ref.hasOwnProperty(action)) {
                            selector = _ref[action];
                            if (!ability[action]) {
                                _results.push(selector.disable.apply(this));
                            } else {
                                _results.push(selector.enable.apply(this));
                            }
                        }
                    }
                    return _results;
                },
            };
            DiscussionContentView.prototype.abilityRenderer = {
                editable: {
                    enable: function () {
                        return this.$(".action-edit").closest(".actions-item").removeClass("is-hidden");
                    },
                    disable: function () {
                        return this.$(".action-edit").closest(".actions-item").addClass("is-hidden");
                    },
                },
                can_delete: {
                    enable: function () {
                        return this.$(".action-delete").closest(".actions-item").removeClass("is-hidden");
                    },
                    disable: function () {
                        return this.$(".action-delete").closest(".actions-item").addClass("is-hidden");
                    },
                },
                can_openclose: {
                    enable: function () {
                        var self = this;
                        return _.each([".action-close", ".action-pin"], function (selector) {
                            return self.$(selector).closest(".actions-item").removeClass("is-hidden");
                        });
                    },
                    disable: function () {
                        var self = this;
                        return _.each([".action-close", ".action-pin"], function (selector) {
                            return self.$(selector).closest(".actions-item").addClass("is-hidden");
                        });
                    },
                },
                can_report: {
                    enable: function () {
                        return this.$(".action-report").closest(".actions-item").removeClass("is-hidden");
                    },
                    disable: function () {
                        return this.$(".action-report").closest(".actions-item").addClass("is-hidden");
                    },
                },
                can_vote: {
                    enable: function () {
                        this.$(".action-vote").closest(".actions-item").removeClass("is-disabled");
                    },
                    disable: function () {
                        this.$(".action-vote").closest(".actions-item").addClass("is-disabled");
                    },
                },
            };
            DiscussionContentView.prototype.renderPartialAttrs = function () {
                var attr, value, _ref, _results;
                _ref = this.model.changedAttributes();
                _results = [];
                for (attr in _ref) {
                    if (_ref.hasOwnProperty(attr)) {
                        value = _ref[attr];
                        if (this.attrRenderer[attr]) {
                            _results.push(this.attrRenderer[attr].apply(this, [value]));
                        } else {
                            _results.push(void 0);
                        }
                    }
                }
                return _results;
            };
            DiscussionContentView.prototype.renderAttrs = function () {
                var attr, value, _ref, _results;
                _ref = this.model.attributes;
                _results = [];
                for (attr in _ref) {
                    if (_ref.hasOwnProperty(attr)) {
                        value = _ref[attr];
                        if (this.attrRenderer[attr]) {
                            _results.push(this.attrRenderer[attr].apply(this, [value]));
                        } else {
                            _results.push(void 0);
                        }
                    }
                }
                return _results;
            };
            DiscussionContentView.prototype.makeWmdEditor = function (classIdentifier) {
                if (!this.$el.find(".wmd-panel").length) {
                    return DiscussionUtil.makeWmdEditor(this.$el, $.proxy(this.$, this), classIdentifier, 5);
                } else {
                    return null;
                }
            };
            DiscussionContentView.prototype.getWmdEditor = function (classIdentifier) {
                return DiscussionUtil.getWmdEditor(this.$el, $.proxy(this.$, this), classIdentifier);
            };
            DiscussionContentView.prototype.getWmdContent = function (classIdentifier) {
                return DiscussionUtil.getWmdContent(this.$el, $.proxy(this.$, this), classIdentifier);
            };
            DiscussionContentView.prototype.setWmdContent = function (classIdentifier, text) {
                return DiscussionUtil.setWmdContent(this.$el, $.proxy(this.$, this), classIdentifier, text);
            };
            DiscussionContentView.prototype.initialize = function () {
                var self = this;
                this.model.bind("change", this.renderPartialAttrs, this);
                return this.listenTo(this.model, "change:endorsed", function () {
                    if (self.model instanceof Comment) {
                        self.trigger("comment:endorse");
                    }
                });
            };
            return DiscussionContentView;
        })(Backbone.View);
        this.DiscussionContentShowView = function (_super) {
            __extends(DiscussionContentShowView, _super);
            function DiscussionContentShowView() {
                var self = this;
                this.toggleClose = function () {
                    return DiscussionContentShowView.prototype.toggleClose.apply(self, arguments);
                };
                this.toggleReport = function () {
                    return DiscussionContentShowView.prototype.toggleReport.apply(self, arguments);
                };
                this.togglePin = function () {
                    return DiscussionContentShowView.prototype.togglePin.apply(self, arguments);
                };
                this.toggleVote = function () {
                    return DiscussionContentShowView.prototype.toggleVote.apply(self, arguments);
                };
                this.toggleEndorse = function () {
                    return DiscussionContentShowView.prototype.toggleEndorse.apply(self, arguments);
                };
                this.toggleFollow = function () {
                    return DiscussionContentShowView.prototype.toggleFollow.apply(self, arguments);
                };
                this.handleSecondaryActionBlur = function () {
                    return DiscussionContentShowView.prototype.handleSecondaryActionBlur.apply(self, arguments);
                };
                this.handleSecondaryActionEscape = function () {
                    return DiscussionContentShowView.prototype.handleSecondaryActionEscape.apply(self, arguments);
                };
                this.toggleSecondaryActions = function () {
                    return DiscussionContentShowView.prototype.toggleSecondaryActions.apply(self, arguments);
                };
                this.updateButtonState = function () {
                    return DiscussionContentShowView.prototype.updateButtonState.apply(self, arguments);
                };
                return DiscussionContentShowView.__super__.constructor.apply(this, arguments);
            }
            DiscussionContentShowView.prototype.events = _.reduce(
                [
                    [".action-follow", "toggleFollow"],
                    [".action-answer", "toggleEndorse"],
                    [".action-endorse", "toggleEndorse"],
                    [".action-vote", "toggleVote"],
                    [".action-more", "toggleSecondaryActions"],
                    [".action-pin", "togglePin"],
                    [".action-edit", "edit"],
                    [".action-delete", "_delete"],
                    [".action-report", "toggleReport"],
                    [".action-close", "toggleClose"],
                ],
                function (obj, event) {
                    var funcName, selector;
                    selector = event[0];
                    funcName = event[1];
                    obj["click " + selector] = function (event) {
                        return this[funcName](event);
                    };
                    obj["keydown " + selector] = function (event) {
                        return DiscussionUtil.activateOnSpace(event, this[funcName]);
                    };
                    return obj;
                },
                {}
            );
            DiscussionContentShowView.prototype.updateButtonState = function (selector, checked) {
                var $button;
                $button = this.$(selector);
                $button.toggleClass("is-checked", checked);
                return $button.attr("aria-checked", checked);
            };
            DiscussionContentShowView.prototype.attrRenderer = $.extend({}, DiscussionContentView.prototype.attrRenderer, {
                subscribed: function (subscribed) {
                    return this.updateButtonState(".action-follow", subscribed);
                },
                endorsed: function (endorsed) {
                    var $button, selector;
                    selector = this.model.get("thread").get("thread_type") === "question" ? ".action-answer" : ".action-endorse";
                    this.updateButtonState(selector, endorsed);
                    $button = this.$(selector);
                    $button.closest(".actions-item").toggleClass("is-hidden", !this.model.canBeEndorsed());
                    return $button.toggleClass("is-checked", endorsed);
                },
                votes: function (votes) {
                    var button, numVotes, selector, votesText, votesCountMsg;
                    selector = ".action-vote";
                    this.updateButtonState(selector, window.user.voted(this.model));
                    button = this.$el.find(selector);
                    numVotes = votes.up_count;
                    votesCountMsg = ngettext("there is currently {numVotes} vote", "there are currently {numVotes} votes", numVotes);
                    button
                        .find(".js-sr-vote-count")
                        .empty()
                        .text(edx.StringUtils.interpolate(votesCountMsg, { numVotes: numVotes }));
                    votesText = edx.StringUtils.interpolate(ngettext("{numVotes} Vote", "{numVotes} Votes", numVotes), { numVotes: numVotes });
                    button.find(".vote-count").empty().text(votesText);
                    this.$el.find(".display-vote .vote-count").empty().text(votesText);
                },
                pinned: function (pinned) {
                    this.updateButtonState(".action-pin", pinned);
                    return this.$(".post-label-pinned").toggleClass("is-hidden", !pinned);
                },
                abuse_flaggers: function () {
                    var flagged;
                    flagged = this.model.isFlagged();
                    this.updateButtonState(".action-report", flagged);
                    return this.$(".post-label-reported").toggleClass("is-hidden", !flagged);
                },
                closed: function (closed) {
                    this.updateButtonState(".action-close", closed);
                    this.$(".post-label-closed").toggleClass("is-hidden", !closed);
                    return this.$(".display-vote").toggle(closed);
                },
            });
            DiscussionContentShowView.prototype.toggleSecondaryActions = function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (is_staff || check_dates()){
                    this.secondaryActionsExpanded = !this.secondaryActionsExpanded;
                    this.$(".action-more").toggleClass("is-expanded", this.secondaryActionsExpanded);
                    this.$(".actions-dropdown").toggleClass("is-expanded", this.secondaryActionsExpanded).attr("aria-expanded", this.secondaryActionsExpanded);
                    if (this.secondaryActionsExpanded) {
                        if (event.type === "keydown") {
                            this.$(".action-list-item:first").focus();
                        }
                        $("body").on("click", this.toggleSecondaryActions);
                        $("body").on("keydown", this.handleSecondaryActionEscape);
                        return this.$(".action-list-item").on("blur", this.handleSecondaryActionBlur);
                    } else {
                        $("body").off("click", this.toggleSecondaryActions);
                        $("body").off("keydown", this.handleSecondaryActionEscape);
                        return this.$(".action-list-item").off("blur", this.handleSecondaryActionBlur);
                    }
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            DiscussionContentShowView.prototype.handleSecondaryActionEscape = function (event) {
                if (event.keyCode === 27) {
                    this.toggleSecondaryActions(event);
                    this.$(".action-more").focus();
                }
            };
            DiscussionContentShowView.prototype.handleSecondaryActionBlur = function (event) {
                var self = this;
                return setTimeout(function () {
                    if (self.secondaryActionsExpanded && self.$(".actions-dropdown :focus").length === 0) {
                        self.toggleSecondaryActions(event);
                    }
                }, 10);
            };
            DiscussionContentShowView.prototype.toggleFollow = function (event) {
                var isSubscribing, msg, url;
                event.preventDefault();
                isSubscribing = !this.model.get("subscribed");
                url = this.model.urlFor(isSubscribing ? "follow" : "unfollow");
                if (isSubscribing) {
                    msg = gettext("You could not be subscribed to this post. Refresh the page and try again.");
                } else {
                    msg = gettext("You could not be unsubscribed from this post. Refresh the page and try again.");
                }
                return DiscussionUtil.updateWithUndo(this.model, { subscribed: isSubscribing }, { url: url, type: "POST", $elem: $(event.currentTarget) }, msg);
            };
            DiscussionContentShowView.prototype.toggleEndorse = function (event) {
                var isEndorsing,
                    msg,
                    updates,
                    url,
                    self = this;
                event.preventDefault();
                isEndorsing = !this.model.get("endorsed");
                url = this.model.urlFor("endorse");
                updates = { endorsed: isEndorsing, endorsement: isEndorsing ? { username: DiscussionUtil.getUser().get("username"), user_id: DiscussionUtil.getUser().id, time: new Date().toISOString() } : null };
                if (this.model.get("thread").get("thread_type") === "question") {
                    if (isEndorsing) {
                        msg = gettext("This response could not be marked as an answer. Refresh the page and try again.");
                    } else {
                        msg = gettext("This response could not be unmarked as an answer. Refresh the page and try again.");
                    }
                } else {
                    if (isEndorsing) {
                        msg = gettext("This response could not be marked as endorsed. Refresh the page and try again.");
                    } else {
                        msg = gettext("This response could not be unendorsed. Refresh the page and try again.");
                    }
                }
                return DiscussionUtil.updateWithUndo(this.model, updates, { url: url, type: "POST", data: { endorsed: isEndorsing }, $elem: $(event.currentTarget) }, msg, function () {
                    return self.trigger("comment:endorse");
                }).always(this.trigger("comment:endorse"));
            };
            DiscussionContentShowView.prototype.toggleVote = function (event) {
                var isVoting,
                    updates,
                    url,
                    user,
                    self = this;
                event.preventDefault();
                user = DiscussionUtil.getUser();
                isVoting = !user.voted(this.model);
                url = this.model.urlFor(isVoting ? "upvote" : "unvote");
                updates = { upvoted_ids: (isVoting ? _.union : _.difference)(user.get("upvoted_ids"), [this.model.id]) };
                if (!$(event.target.closest(".actions-item")).hasClass("is-disabled")) {
                    return DiscussionUtil.updateWithUndo(user, updates, { url: url, type: "POST", $elem: $(event.currentTarget) }, gettext("This vote could not be processed. Refresh the page and try again.")).done(function () {
                        if (isVoting) {
                            return self.model.vote();
                        } else {
                            return self.model.unvote();
                        }
                    });
                }
            };
            DiscussionContentShowView.prototype.togglePin = function (event) {
                var isPinning, msg, url;
                event.preventDefault();
                isPinning = !this.model.get("pinned");
                url = this.model.urlFor(isPinning ? "pinThread" : "unPinThread");
                if (isPinning) {
                    msg = gettext("This post could not be pinned. Refresh the page and try again.");
                } else {
                    msg = gettext("This post could not be unpinned. Refresh the page and try again.");
                }
                return DiscussionUtil.updateWithUndo(this.model, { pinned: isPinning }, { url: url, type: "POST", $elem: $(event.currentTarget) }, msg);
            };
            DiscussionContentShowView.prototype.toggleReport = function (event) {
                var isFlagging, msg, updates, url;
                event.preventDefault();
                if (this.model.isFlagged()) {
                    isFlagging = false;
                    msg = gettext("This post could not be flagged for abuse. Refresh the page and try again.");
                } else {
                    isFlagging = true;
                    msg = gettext("This post could not be unflagged for abuse. Refresh the page and try again.");
                }
                url = this.model.urlFor(isFlagging ? "flagAbuse" : "unFlagAbuse");
                updates = { abuse_flaggers: (isFlagging ? _.union : _.difference)(this.model.get("abuse_flaggers"), [DiscussionUtil.getUser().id]) };
                return DiscussionUtil.updateWithUndo(this.model, updates, { url: url, type: "POST", $elem: $(event.currentTarget) }, msg);
            };
            DiscussionContentShowView.prototype.toggleClose = function (event) {
                var isClosing, msg, updates;
                event.preventDefault();
                isClosing = !this.model.get("closed");
                if (isClosing) {
                    msg = gettext("This post could not be closed. Refresh the page and try again.");
                } else {
                    msg = gettext("This post could not be reopened. Refresh the page and try again.");
                }
                updates = { closed: isClosing };
                return DiscussionUtil.updateWithUndo(this.model, updates, { url: this.model.urlFor("close"), type: "POST", data: updates, $elem: $(event.currentTarget) }, msg);
            };
            DiscussionContentShowView.prototype.getAuthorDisplay = function () {
                return _.template($("#post-user-display-template").html())({
                    username: this.model.get("username") || null,
                    user_url: this.model.get("user_url"),
                    is_community_ta: this.model.get("community_ta_authored"),
                    is_staff: this.model.get("staff_authored"),
                });
            };
            DiscussionContentShowView.prototype.getEndorserDisplay = function () {
                var endorsement;
                endorsement = this.model.get("endorsement");
                if (endorsement && endorsement.username) {
                    return _.template($("#post-user-display-template").html())({
                        username: endorsement.username,
                        user_url: DiscussionUtil.urlFor("user_profile", endorsement.user_id),
                        is_community_ta: DiscussionUtil.isTA(endorsement.user_id) || DiscussionUtil.isGroupTA(endorsement.user_id),
                        is_staff: DiscussionUtil.isStaff(endorsement.user_id),
                    });
                } else {
                    return null;
                }
            };
            return DiscussionContentShowView;
        }.call(this, this.DiscussionContentView);
    }
}.call(window));
(function () {
    "use strict";
    this.EolDiscussionInlineView = Backbone.View.extend({
        events: {
            "click .discussion-show": "toggleDiscussion",
            "keydown .discussion-show": function (event) {
                return DiscussionUtil.activateOnSpace(event, this.toggleDiscussion);
            },
            "click .new-post-btn": "toggleNewPost",
            "click .all-posts-btn": "navigateToAllPosts",
            keydown: "handleKeydown",
            "keydown .new-post-btn": function (event) {
                return DiscussionUtil.activateOnSpace(event, this.toggleNewPost);
            },
        },
        page_re: /\?discussion_page=(\d+)/,
        initialize: function (options) {
            var match;
            this.$el = options.el;
            limitCharacter = options.limitCharacter;
            startForum = options.start;
            finishForum = options.finish;
            is_dated = options.isDated;
            is_staff = options.isStaff;
            this.readOnly = options.readOnly;
            this.toggleDiscussionBtn = this.$(".discussion-show");
            this.listenTo(this.model, "change", this.render);
            this.escKey = 27;
            if (options.startHeader !== undefined) {
                this.startHeader = options.startHeader;
            } else {
                this.startHeader = 4;
            }
            match = this.page_re.exec(window.location.href);
            if (match) {
                this.page = parseInt(match[1], 10);
            } else {
                this.page = 1;
            }
            this.defaultSortKey = "activity";
            this.defaultSortOrder = "desc";
            this.toggleDiscussion();
        },
        loadDiscussions: function ($elem, error) {
            var discussionId = this.$el.data("discussion-id"),
                url = DiscussionUtil.urlFor("retrieve_discussion", discussionId) + ("?page=" + this.page) + ("&sort_key=" + this.defaultSortKey) + ("&sort_order=" + this.defaultSortOrder),
                self = this;
            DiscussionUtil.safeAjax({
                $elem: this.$el,
                $loading: this.$el,
                takeFocus: false,
                url: url,
                type: "GET",
                dataType: "json",
                success: function (response, textStatus) {
                    self.renderDiscussion(self.$el, response, textStatus, discussionId);
                },
                error: error,
            });
        },
        renderDiscussion: function ($elem, response, textStatus, discussionId) {
            var discussionHtml,
                user = new DiscussionUser(response.user_info),
                self = this;
            $elem.focus();
            window.user = user;
            DiscussionUtil.setUser(user);
            Content.loadContentInfos(response.annotated_content_info);
            DiscussionUtil.loadRoles(response.roles);
            this.courseSettings = new DiscussionCourseSettings(response.course_settings);
            this.is_commentable_divided = response.is_commentable_divided;
            this.discussion = new Discussion(undefined, { pages: response.num_pages });
            this.discussion.reset(response.discussion_data, { silent: false });
            discussionHtml = edx.HtmlUtils.template($("#inline-discussion-template").html())({ threads: response.discussion_data, read_only: this.readOnly, discussionId: discussionId });
            if (this.$("section.discussion").length) {
                edx.HtmlUtils.setHtml(this.$el, discussionHtml);
                this.$("section.discussion").replaceWith(edx.HtmlUtils.ensureHtml(discussionHtml).toString());
            } else {
                edx.HtmlUtils.append(this.$el, discussionHtml);
            }
            this.threadListView = new DiscussionThreadListView({ el: this.$(".inline-threads"), collection: self.discussion, courseSettings: self.courseSettings });
            this.threadListView.render();
            this.threadListView.on("thread:selected", _.bind(this.navigateToThread, this));
            DiscussionUtil.bulkUpdateContentInfo(window.$$annotated_content_info);
            this.newPostForm = this.$el.find(".new-post-article");
            this.newPostView = new NewPostView({
                el: this.newPostForm,
                collection: this.discussion,
                course_settings: this.courseSettings,
                topicId: discussionId,
                startHeader: this.startHeader,
                is_commentable_divided: response.is_commentable_divided,
                user_group_id: response.user_group_id,
            });
            this.newPostView.render();
            this.listenTo(this.newPostView, "newPost:createPost", this.onNewPostCreated);
            this.listenTo(this.newPostView, "newPost:cancel", this.hideNewPost);
            this.discussion.on("add", this.addThread);
            this.retrieved = true;
            this.showed = true;
            if (this.isWaitingOnNewPost) {
                this.newPostForm.removeClass("is-hidden").focus();
            }
            this.$(".inline-thread").addClass("is-hidden");
        },
        navigateToThread: function (threadId) {
            var thread = this.discussion.get(threadId);
            this.threadView = new DiscussionThreadView({
                el: this.$(".forum-content"),
                model: thread,
                mode: "inline",
                startHeader: this.startHeader,
                courseSettings: this.courseSettings,
                is_commentable_divided: this.is_commentable_divided,
            });
            this.threadView.render();
            this.listenTo(this.threadView.showView, "thread:_delete", this.navigateToAllPosts);
            this.threadListView.$el.addClass("is-hidden");
            this.$(".inline-thread").removeClass("is-hidden");
        },
        navigateToAllPosts: function () {
            //this.$el[0].getElementsByClassName('new-post-btn')[0].style.display = 'block';
            $(".new-post-btn").show();
            this.$(".inline-thread").addClass("is-hidden");
            if (this.threadView) {
                this.threadView.$el.empty().off();
                this.threadView.stopListening();
                this.threadView = null;
            }
            this.threadListView.$el.removeClass("is-hidden");
            this.threadListView.$(".is-active").focus();
        },
        hideDiscussion: function () {
            this.$("section.discussion").addClass("is-hidden");
            this.toggleDiscussionBtn.removeClass("shown");
            this.toggleDiscussionBtn.find(".button-text").text(gettext("Show Discussion"));
            this.showed = false;
        },
        toggleDiscussion: function () {
            var self = this;
            if (this.showed) {
                this.hideDiscussion();
            } else {
                this.toggleDiscussionBtn.addClass("shown");
                this.toggleDiscussionBtn.find(".button-text").text(gettext("Hide Discussion"));
                if (this.retrieved) {
                    this.$("section.discussion").removeClass("is-hidden");
                    this.showed = true;
                } else {
                    this.loadDiscussions(this.$el, function (request) {
                        if (request.status === 403 && request.responseText) {
                            DiscussionUtil.discussionAlert(gettext("Warning"), request.responseText);
                            self.$el.text(request.responseText);
                            self.showed = true;
                        } else {
                            self.hideDiscussion();
                            DiscussionUtil.discussionAlert(gettext("Error"), gettext("This discussion could not be loaded. Refresh the page and try again."));
                        }
                    });
                }
            }
        },
        toggleNewPost: function (event) {
            event.preventDefault();
            if (is_staff || check_dates()){
                if (!this.newPostForm) {
                    this.toggleDiscussion();
                    this.isWaitingOnNewPost = true;
                    return;
                }
                if (this.showed) {
                    this.$("section.discussion").find(".inline-discussion-thread-container").addClass("is-hidden");
                    this.$("section.discussion").find(".add_post_btn_container").addClass("is-hidden");
                    this.newPostForm.removeClass("is-hidden");
                }
                this.newPostView.$el.removeClass("is-hidden");
                this.toggleDiscussionBtn.addClass("shown");
                this.toggleDiscussionBtn.find(".button-text").text(gettext("Hide Discussion"));
                this.showed = true;
            }
            else {
                alert('El Foro ha finalizado.');
                document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
            }
        },
        onNewPostCreated: function () {
            this.navigateToAllPosts();
            this.hideNewPost();
        },
        hideNewPost: function () {
            this.$("section.discussion").find(".inline-discussion-thread-container").removeClass("is-hidden");
            this.$("section.discussion").find(".add_post_btn_container").removeClass("is-hidden").focus();
            this.newPostForm.addClass("is-hidden");
        },
        handleKeydown: function (event) {
            var keyCode = event.keyCode;
            if (keyCode === this.escKey) {
                this.$("section.discussion").find(".cancel").trigger("click");
            }
        },
    });
}.call(window));
(function () {
    "use strict";
    if (Backbone) {
        this.DiscussionThreadEditView = Backbone.View.extend({
            tagName: "form",
            events: { submit: "updateHandler", "click .post-cancel": "cancelHandler" },
            attributes: { class: "discussion-post edit-post-form" },
            initialize: function (options) {
                this.container = options.container || $(".thread-content-wrapper");
                this.mode = options.mode || "inline";
                this.startHeader = options.startHeader;
                this.course_settings = options.course_settings;
                this.threadType = this.model.get("thread_type");
                this.topicId = this.model.get("commentable_id");
                this.context = options.context || "course";
                _.bindAll(this, "updateHandler", "cancelHandler");
                return this;
            },
            render: function () {
                var formId = _.uniqueId("form-"),
                    threadTypeTemplate = edx.HtmlUtils.template($("#thread-type-template").html()),
                    $threadTypeSelector = $(threadTypeTemplate({ form_id: formId }).toString()),
                    context,
                    mainTemplate = edx.HtmlUtils.template($("#thread-edit-template").html());
                context = $.extend({ mode: this.mode, startHeader: this.startHeader }, this.model.attributes);
                edx.HtmlUtils.setHtml(this.$el, mainTemplate(context));
                this.container.append(this.$el);
                this.$submitBtn = this.$(".post-update");
                this.addField($threadTypeSelector);
                this.$("#" + formId + "-post-type-" + this.threadType).attr("checked", true);
                if (this.isTabMode()) {
                    this.topicView = new DiscussionTopicMenuView({ topicId: this.topicId, course_settings: this.course_settings });
                    this.addField(this.topicView.render());
                }
                DiscussionUtil.makeWmdEditor(this.$el, $.proxy(this.$, this), "edit-post-body", 4);
                var text = this.$el.find('.eol-text-limit')[0].textContent;
                var span_limit = this.$el.find('#eol-limit-character')[0];
                span_limit.textContent = limitCharacter - text.length;
                span_limit.textContent = span_limit.textContent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                return this;
            },
            addField: function ($fieldView) {
                this.$(".forum-edit-post-form-wrapper").append($fieldView);
                return this;
            },
            isTabMode: function () {
                return this.mode === "tab";
            },
            save: function () {
                var title = this.$(".edit-post-title").val(),
                    threadType = this.$(".input-radio:checked").val(),
                    body = this.$(".edit-post-body textarea").val(),
                    postData = { title: title, thread_type: threadType, body: body };
                if (this.topicView) {
                    postData.commentable_id = this.topicView.getCurrentTopicId();
                }
                return DiscussionUtil.safeAjax({
                    $elem: this.$submitBtn,
                    $loading: this.$submitBtn,
                    url: DiscussionUtil.urlFor("update_thread", this.model.id),
                    type: "POST",
                    dataType: "json",
                    data: postData,
                    error: DiscussionUtil.formErrorHandler(this.$(".post-errors")),
                    success: function () {
                        this.$(".edit-post-title").val("").attr("prev-text", "");
                        this.$(".edit-post-body textarea").val("").attr("prev-text", "");
                        this.$(".wmd-preview p").html("");
                        if (this.topicView) {
                            postData.courseware_title = this.topicView.getFullTopicName();
                        }
                        this.model.set(postData).unset("abbreviatedBody");
                        this.trigger("thread:updated");
                        if (this.threadType !== threadType) {
                            this.model.set("thread_type", threadType);
                            this.model.trigger("thread:thread_type_updated");
                            this.trigger("comment:endorse");
                        }
                    }.bind(this),
                });
            },
            updateHandler: function (event) {
                event.preventDefault();
                if (is_staff || check_dates()){
                    this.trigger("thread:update", event);
                    this.save();
                    return this;
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            },
            cancelHandler: function (event) {
                event.preventDefault();
                this.trigger("thread:cancel_edit", event);
                this.remove();
                return this;
            },
        });
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.DiscussionThreadListView = function (_super) {
            __extends(DiscussionThreadListView, _super);
            function DiscussionThreadListView() {
                var self = this;
                this.updateEmailNotifications = function () {
                    return DiscussionThreadListView.prototype.updateEmailNotifications.apply(self, arguments);
                };
                this.retrieveFollowed = function () {
                    return DiscussionThreadListView.prototype.retrieveFollowed.apply(self, arguments);
                };
                this.chooseGroup = function () {
                    return DiscussionThreadListView.prototype.chooseGroup.apply(self, arguments);
                };
                this.chooseFilter = function () {
                    return DiscussionThreadListView.prototype.chooseFilter.apply(self, arguments);
                };
                this.threadRemoved = function () {
                    return DiscussionThreadListView.prototype.threadRemoved.apply(self, arguments);
                };
                this.threadSelected = function () {
                    return DiscussionThreadListView.prototype.threadSelected.apply(self, arguments);
                };
                this.renderThread = function () {
                    return DiscussionThreadListView.prototype.renderThread.apply(self, arguments);
                };
                this.loadMorePages = function () {
                    return DiscussionThreadListView.prototype.loadMorePages.apply(self, arguments);
                };
                this.showMetadataAccordingToSort = function () {
                    return DiscussionThreadListView.prototype.showMetadataAccordingToSort.apply(self, arguments);
                };
                this.renderThreads = function () {
                    return DiscussionThreadListView.prototype.renderThreads.apply(self, arguments);
                };
                this.addAndSelectThread = function () {
                    return DiscussionThreadListView.prototype.addAndSelectThread.apply(self, arguments);
                };
                this.reloadDisplayedCollection = function () {
                    return DiscussionThreadListView.prototype.reloadDisplayedCollection.apply(self, arguments);
                };
                this.clearSearchAlerts = function () {
                    return DiscussionThreadListView.prototype.clearSearchAlerts.apply(self, arguments);
                };
                this.removeSearchAlert = function () {
                    return DiscussionThreadListView.prototype.removeSearchAlert.apply(self, arguments);
                };
                this.addSearchAlert = function () {
                    return DiscussionThreadListView.prototype.addSearchAlert.apply(self, arguments);
                };
                this.performSearch = function () {
                    return DiscussionThreadListView.prototype.performSearch.apply(self, arguments);
                };
                return DiscussionThreadListView.__super__.constructor.apply(this, arguments);
            }
            DiscussionThreadListView.prototype.events = {
                "keypress .forum-nav-browse-filter-input": function (event) {
                    return DiscussionUtil.ignoreEnterKey(event);
                },
                "change .forum-nav-sort-control": "sortThreads",
                "click .forum-nav-thread-link": "threadSelected",
                "click .forum-nav-load-more-link": "loadMorePages",
                "change .forum-nav-filter-main-control": "chooseFilter",
                "change .forum-nav-filter-cohort-control": "chooseGroup",
            };
            DiscussionThreadListView.prototype.initialize = function (options) {
                var self = this;
                this.courseSettings = options.courseSettings;
                this.supportsActiveThread = options.supportsActiveThread;
                this.hideReadState = options.hideReadState || false;
                this.displayedCollection = new Discussion(this.collection.models, { pages: this.collection.pages });
                this.collection.on("change", this.reloadDisplayedCollection);
                this.discussionIds = this.$el.data("discussion-id") || "";
                this.collection.on("reset", function (discussion) {
                    self.displayedCollection.current_page = discussion.current_page;
                    self.displayedCollection.pages = discussion.pages;
                    return self.displayedCollection.reset(discussion.models);
                });
                this.collection.on("add", this.addAndSelectThread);
                this.collection.on("thread:remove", this.threadRemoved);
                this.sidebar_padding = 10;
                this.boardName = null;
                this.current_search = "";
                this.mode = options.mode || "commentables";
                this.showThreadPreview = true;
                this.searchAlertCollection = new Backbone.Collection([], { model: Backbone.Model });
                this.searchAlertCollection.on("add", function (searchAlert) {
                    var content;
                    content = edx.HtmlUtils.template($("#search-alert-template").html())({ messageHtml: searchAlert.attributes.message, cid: searchAlert.cid, css_class: searchAlert.attributes.css_class });
                    edx.HtmlUtils.append(self.$(".search-alerts"), content);
                    return self.$("#search-alert-" + searchAlert.cid + " .dismiss").bind("click", searchAlert, function (event) {
                        return self.removeSearchAlert(event.data.cid);
                    });
                });
                this.searchAlertCollection.on("remove", function (searchAlert) {
                    return self.$("#search-alert-" + searchAlert.cid).remove();
                });
                this.searchAlertCollection.on("reset", function () {
                    return self.$(".search-alerts").empty();
                });
                this.template = edx.HtmlUtils.template($("#thread-list-template").html());
                this.threadListItemTemplate = edx.HtmlUtils.template($("#thread-list-item-template").html());
            };
            DiscussionThreadListView.prototype.addSearchAlert = function (message, cssClass) {
                var searchAlertModel = new Backbone.Model({ message: message, css_class: cssClass || "" });
                this.searchAlertCollection.add(searchAlertModel);
                return searchAlertModel;
            };
            DiscussionThreadListView.prototype.removeSearchAlert = function (searchAlert) {
                return this.searchAlertCollection.remove(searchAlert);
            };
            DiscussionThreadListView.prototype.clearSearchAlerts = function () {
                return this.searchAlertCollection.reset();
            };
            DiscussionThreadListView.prototype.reloadDisplayedCollection = function (thread) {
                var active, $content, $currentElement, threadId;
                this.clearSearchAlerts();
                threadId = thread.get("id");
                $content = this.renderThread(thread);
                $currentElement = this.$(".forum-nav-thread[data-id=" + threadId + "]");
                active = $currentElement.has(".forum-nav-thread-link.is-active").length !== 0;
                $currentElement.replaceWith($content);
                this.showMetadataAccordingToSort();
                if (this.supportsActiveThread && active) {
                    this.setActiveThread(threadId);
                }
            };
            DiscussionThreadListView.prototype.addAndSelectThread = function (thread) {
                var commentableId = thread.get("commentable_id"),
                    self = this;
                return this.retrieveDiscussion(commentableId, function () {
                    return self.trigger("thread:created", thread.get("id"));
                });
            };
            DiscussionThreadListView.prototype.ignoreClick = function (event) {
                return event.stopPropagation();
            };
            DiscussionThreadListView.prototype.render = function () {
                var self = this;
                this.timer = 0;
                this.$el.empty();
                edx.HtmlUtils.append(this.$el, this.template({ isDiscussionDivisionEnabled: this.courseSettings.get("is_discussion_division_enabled"), isPrivilegedUser: DiscussionUtil.isPrivilegedUser() }));
                if (this.hideReadState) {
                    this.$(".forum-nav-filter-main").addClass("is-hidden");
                }
                this.$(".forum-nav-sort-control option").removeProp("selected");
                this.$(".forum-nav-sort-control option[value=" + this.collection.sort_preference + "]").prop("selected", true);
                this.displayedCollection.on("reset", this.renderThreads);
                this.displayedCollection.on("thread:remove", this.renderThreads);
                this.displayedCollection.on("change:commentable_id", function () {
                    if (self.mode === "commentables") {
                        self.retrieveDiscussions(self.discussionIds.split(","));
                    }
                });
                this.renderThreads();
                return this;
            };
            DiscussionThreadListView.prototype.renderThreads = function () {
                var $content, thread, i, len;
                this.$(".forum-nav-thread-list").empty();
                for (i = 0, len = this.displayedCollection.models.length; i < len; i++) {
                    thread = this.displayedCollection.models[i];
                    $content = this.renderThread(thread);
                    this.$(".forum-nav-thread-list").append($content);
                }
                if (this.$(".forum-nav-thread-list li").length === 0) {
                    this.clearSearchAlerts();
                    this.addSearchAlert(gettext("There are no posts in this topic yet."));
                }
                this.showMetadataAccordingToSort();
                this.renderMorePages();
                this.trigger("threads:rendered");
            };
            DiscussionThreadListView.prototype.showMetadataAccordingToSort = function () {
                var voteCounts = this.$(".forum-nav-thread-votes-count"),
                    unreadCommentCounts = this.$(".forum-nav-thread-unread-comments-count"),
                    commentCounts = this.$(".forum-nav-thread-comments-count");
                voteCounts.hide();
                commentCounts.hide();
                unreadCommentCounts.hide();
                switch (this.$(".forum-nav-sort-control").val()) {
                    case "votes":
                        voteCounts.show();
                        break;
                    default:
                        unreadCommentCounts.show();
                        commentCounts.show();
                }
            };
            DiscussionThreadListView.prototype.renderMorePages = function () {
                if (this.displayedCollection.hasMorePages()) {
                    edx.HtmlUtils.append(this.$(".forum-nav-thread-list"), edx.HtmlUtils.template($("#nav-load-more-link").html())({}));
                }
            };
            DiscussionThreadListView.prototype.getLoadingContent = function (srText) {
                return edx.HtmlUtils.template($("#nav-loading-template").html())({ srText: srText });
            };
            DiscussionThreadListView.prototype.loadMorePages = function (event) {
                var error,
                    lastThread,
                    loadMoreElem,
                    loadingElem,
                    options,
                    ref,
                    self = this;
                if (event) {
                    event.preventDefault();
                }
                loadMoreElem = this.$(".forum-nav-load-more");
                loadMoreElem.empty();
                edx.HtmlUtils.append(loadMoreElem, this.getLoadingContent(gettext("Loading more threads")));
                loadingElem = loadMoreElem.find(".forum-nav-loading");
                DiscussionUtil.makeFocusTrap(loadingElem);
                loadingElem.focus();
                options = { filter: this.filter };
                switch (this.mode) {
                    case "search":
                        options.search_text = this.current_search;
                        if (this.group_id) {
                            options.group_id = this.group_id;
                        }
                        break;
                    case "followed":
                        options.user_id = window.user.id;
                        break;
                    case "user":
                        options.user_id = this.$el.parent().data("user-id");
                        break;
                    case "commentables":
                        options.commentable_ids = this.discussionIds;
                        if (this.group_id) {
                            options.group_id = this.group_id;
                        }
                        break;
                    case "all":
                        if (this.group_id) {
                            options.group_id = this.group_id;
                        }
                        break;
                    default:
                }
                ref = this.collection.last();
                lastThread = ref ? ref.get("id") : void 0;
                if (lastThread) {
                    this.once("threads:rendered", function () {
                        var classSelector = ".forum-nav-thread[data-id='" + lastThread + "'] + .forum-nav-thread " + ".forum-nav-thread-link";
                        return $(classSelector).focus();
                    });
                } else {
                    this.once("threads:rendered", function () {
                        var ref1 = $(".forum-nav-thread-link").first();
                        return ref1 ? ref1.focus() : void 0;
                    });
                }
                error = function () {
                    self.renderThreads();
                    DiscussionUtil.discussionAlert(gettext("Error"), gettext("Additional posts could not be loaded. Refresh the page and try again."));
                };
                return this.collection.retrieveAnotherPage(this.mode, options, { sort_key: this.$(".forum-nav-sort-control").val() }, error);
            };
            DiscussionThreadListView.prototype.containsMarkup = function (threadBody) {
                var imagePostSearchString = "![",
                    mathJaxSearchString = /\$/g,
                    containsImages = threadBody.indexOf(imagePostSearchString) !== -1,
                    containsMathJax = (threadBody.match(mathJaxSearchString) || []).length > 1;
                return containsImages || containsMathJax;
            };
            DiscussionThreadListView.prototype.renderThread = function (thread) {
                var threadCommentCount = thread.get("comments_count"),
                    threadUnreadCommentCount = thread.get("unread_comments_count"),
                    neverRead = !thread.get("read") || threadUnreadCommentCount > 0,
                    threadPreview = this.containsMarkup(thread.get("body")) ? "" : thread.get("body"),
                    context = _.extend({ neverRead: neverRead, threadUrl: thread.urlFor("retrieve"), threadPreview: threadPreview, showThreadPreview: this.showThreadPreview, hideReadState: this.hideReadState }, thread.toJSON());
                return $(this.threadListItemTemplate(context).toString());
            };
            DiscussionThreadListView.prototype.threadSelected = function (e) {
                //this.$el[0].parentElement.parentElement.getElementsByClassName('new-post-btn')[0].style.display = 'none';
                $(".new-post-btn").hide();
                var threadId;
                threadId = $(e.target).closest(".forum-nav-thread").attr("data-id");
                if (!$(e.target).closest(".forum-nav-thread")[0].classList.contains('eol-read')) {
                    $(e.target).closest(".forum-nav-thread")[0].classList.add("eol-read");
                }
                if (this.supportsActiveThread) {
                    this.setActiveThread(threadId);
                }
                this.trigger("thread:selected", threadId);
                return false;
            };
            DiscussionThreadListView.prototype.threadRemoved = function (thread) {
                this.trigger("thread:removed", thread);
            };
            DiscussionThreadListView.prototype.setActiveThread = function (threadId) {
                var $srElem;
                this.$(".forum-nav-thread-link").find(".sr").remove();
                this.$(".forum-nav-thread[data-id!='" + threadId + "'] .forum-nav-thread-link").removeClass("is-active");
                $srElem = edx.HtmlUtils.joinHtml(edx.HtmlUtils.HTML('<span class="sr">'), edx.HtmlUtils.ensureHtml(gettext("Current conversation")), edx.HtmlUtils.HTML("</span>")).toString();
                this.$(".forum-nav-thread[data-id='" + threadId + "'] .forum-nav-thread-link")
                    .addClass("is-active")
                    .find(".forum-nav-thread-wrapper-1")
                    .prepend($srElem);
            };
            DiscussionThreadListView.prototype.selectTopic = function ($target) {
                var allItems, discussionIds, $item;
                $item = $target.closest(".forum-nav-browse-menu-item");
                if ($item.hasClass("forum-nav-browse-menu-all")) {
                    this.discussionIds = "";
                    this.$(".forum-nav-filter-cohort").show();
                    return this.retrieveAllThreads();
                } else if ($item.hasClass("forum-nav-browse-menu-following")) {
                    this.retrieveFollowed();
                    return this.$(".forum-nav-filter-cohort").hide();
                } else {
                    allItems = $item.find(".forum-nav-browse-menu-item").andSelf();
                    discussionIds = allItems
                        .filter("[data-discussion-id]")
                        .map(function (i, elem) {
                            return $(elem).data("discussion-id");
                        })
                        .get();
                    this.retrieveDiscussions(discussionIds);
                    return this.$(".forum-nav-filter-cohort").toggle($item.data("divided") === true);
                }
            };
            DiscussionThreadListView.prototype.chooseFilter = function () {
                this.filter = $(".forum-nav-filter-main-control :selected").val();
                this.clearSearchAlerts();
                return this.retrieveFirstPage();
            };
            DiscussionThreadListView.prototype.chooseGroup = function () {
                this.group_id = this.$(".forum-nav-filter-cohort-control :selected").val();
                return this.retrieveFirstPage();
            };
            DiscussionThreadListView.prototype.retrieveDiscussion = function (discussionId, callback) {
                var url = DiscussionUtil.urlFor("retrieve_discussion", discussionId),
                    self = this;
                return DiscussionUtil.safeAjax({
                    url: url,
                    type: "GET",
                    success: function (response) {
                        self.collection.current_page = response.page;
                        self.collection.pages = response.num_pages;
                        self.collection.reset(response.discussion_data);
                        Content.loadContentInfos(response.annotated_content_info);
                        self.displayedCollection.reset(self.collection.models);
                        if (callback) {
                            callback();
                        }
                    },
                });
            };
            DiscussionThreadListView.prototype.retrieveDiscussions = function (discussionIds) {
                this.discussionIds = discussionIds.join(",");
                this.mode = "commentables";
                return this.retrieveFirstPage();
            };
            DiscussionThreadListView.prototype.retrieveAllThreads = function () {
                this.mode = "all";
                return this.retrieveFirstPage();
            };
            DiscussionThreadListView.prototype.retrieveFirstPage = function (event) {
                this.collection.current_page = 0;
                this.$(".forum-nav-thread-list").empty();
                this.collection.models = [];
                return this.loadMorePages(event);
            };
            DiscussionThreadListView.prototype.sortThreads = function (event) {
                this.displayedCollection.setSortComparator(this.$(".forum-nav-sort-control").val());
                return this.retrieveFirstPage(event);
            };
            DiscussionThreadListView.prototype.performSearch = function ($searchInput) {
                this.trigger("search:initiated");
                this.searchFor($searchInput.val(), $searchInput);
            };
            DiscussionThreadListView.prototype.searchFor = function (text, $searchInput) {
                var url = DiscussionUtil.urlFor("search"),
                    self = this;
                this.clearSearchAlerts();
                this.clearFilters();
                this.mode = "search";
                this.current_search = text;
                return DiscussionUtil.safeAjax({
                    $elem: $searchInput,
                    data: { text: text },
                    url: url,
                    type: "GET",
                    dataType: "json",
                    $loading: $,
                    loadingCallback: function () {
                        var element = self.$(".forum-nav-thread-list");
                        element.empty();
                        edx.HtmlUtils.append(element, edx.HtmlUtils.joinHtml(edx.HtmlUtils.HTML("<li class='forum-nav-load-more'>"), self.getLoadingContent(gettext("Loading posts list")), edx.HtmlUtils.HTML("</li>")));
                    },
                    loadedCallback: function () {
                        return self.$(".forum-nav-thread-list .forum-nav-load-more").remove();
                    },
                    success: function (response, textStatus) {
                        var message, noResponseMsg;
                        if (textStatus === "success") {
                            self.collection.reset(response.discussion_data);
                            self.clearSearchAlerts();
                            Content.loadContentInfos(response.annotated_content_info);
                            self.collection.current_page = response.page;
                            self.collection.pages = response.num_pages;
                            if (!_.isNull(response.corrected_text)) {
                                noResponseMsg = _.escape(gettext("No results found for {original_query}. " + "Showing results for {suggested_query}."));
                                message = edx.HtmlUtils.interpolateHtml(noResponseMsg, {
                                    original_query: edx.HtmlUtils.joinHtml(edx.HtmlUtils.HTML("<em>"), text, edx.HtmlUtils.HTML("</em>")),
                                    suggested_query: edx.HtmlUtils.joinHtml(edx.HtmlUtils.HTML("<em>"), response.corrected_text, edx.HtmlUtils.HTML("</em>")),
                                });
                                self.addSearchAlert(message);
                            } else if (response.discussion_data.length === 0) {
                                self.addSearchAlert(gettext("No posts matched your query."));
                                self.displayedCollection.models = [];
                            }
                            if (self.collection.models.length !== 0) {
                                self.displayedCollection.reset(self.collection.models);
                            }
                            if (text) {
                                return self.searchForUser(text);
                            }
                        }
                        return response;
                    },
                });
            };
            DiscussionThreadListView.prototype.searchForUser = function (text) {
                var self = this;
                return DiscussionUtil.safeAjax({
                    data: { username: text },
                    url: DiscussionUtil.urlFor("users"),
                    type: "GET",
                    dataType: "json",
                    error: function () {},
                    success: function (response) {
                        var message, username;
                        if (response.users.length > 0) {
                            username = edx.HtmlUtils.joinHtml(
                                edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML('<a class="link-jump" href="{url}">'), { url: DiscussionUtil.urlFor("user_profile", response.users[0].id) }),
                                response.users[0].username,
                                edx.HtmlUtils.HTML("</a>")
                            );
                            message = edx.HtmlUtils.interpolateHtml(gettext("Show posts by {username}."), { username: username });
                            self.addSearchAlert(message, "search-by-user");
                        }
                    },
                });
            };
            DiscussionThreadListView.prototype.clearFilters = function () {
                this.$(".forum-nav-filter-main-control").val("all");
                return this.$(".forum-nav-filter-cohort-control").val("all");
            };
            DiscussionThreadListView.prototype.retrieveFollowed = function () {
                this.mode = "followed";
                return this.retrieveFirstPage();
            };
            DiscussionThreadListView.prototype.updateEmailNotifications = function () {
                var $checkbox, checked, urlName;
                $checkbox = $("input.email-setting");
                checked = $checkbox.prop("checked");
                urlName = checked ? "enable_notifications" : "disable_notifications";
                DiscussionUtil.safeAjax({
                    url: DiscussionUtil.urlFor(urlName),
                    type: "POST",
                    error: function () {
                        $checkbox.prop("checked", !checked);
                    },
                });
            };
            return DiscussionThreadListView;
        }.call(this, Backbone.View);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.DiscussionThreadProfileView = (function (_super) {
            __extends(DiscussionThreadProfileView, _super);
            function DiscussionThreadProfileView() {
                return DiscussionThreadProfileView.__super__.constructor.apply(this, arguments);
            }
            DiscussionThreadProfileView.prototype.render = function () {
                var params;
                this.convertMath();
                this.abbreviateBody();
                params = $.extend(this.model.toJSON(), { permalink: this.model.urlFor("retrieve") });
                if (!this.model.get("anonymous")) {
                    params = $.extend(params, { user: { username: this.model.username, user_url: this.model.user_url } });
                }
                edx.HtmlUtils.setHtml(this.$el, edx.HtmlUtils.template($("#profile-thread-template").html())(params));
                this.$("span.timeago").timeago();
                DiscussionUtil.typesetMathJax(this.$(".post-body"));
                return this;
            };
            DiscussionThreadProfileView.prototype.convertMath = function () {
                var htmlSnippet = DiscussionUtil.markdownWithHighlight(this.model.get("body"));
                this.model.set("markdownBody", htmlSnippet);
            };
            DiscussionThreadProfileView.prototype.abbreviateBody = function () {
                var abbreviated;
                abbreviated = DiscussionUtil.abbreviateHTML(this.model.get("markdownBody"), 140);
                this.model.set("abbreviatedBody", abbreviated);
            };
            return DiscussionThreadProfileView;
        })(Backbone.View);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.DiscussionThreadShowView = (function (_super) {
            __extends(DiscussionThreadShowView, _super);
            function DiscussionThreadShowView() {
                return DiscussionThreadShowView.__super__.constructor.apply(this, arguments);
            }
            DiscussionThreadShowView.prototype.initialize = function (options) {
                var _ref;
                DiscussionThreadShowView.__super__.initialize.call(this);
                this.mode = options.mode || "inline";
                this.startHeader = options.startHeader;
                this.is_commentable_divided = options.is_commentable_divided;
                if ((_ref = this.mode) !== "tab" && _ref !== "inline") {
                    throw new Error("invalid mode: " + this.mode);
                }
            };
            DiscussionThreadShowView.prototype.renderTemplate = function () {
                var context = $.extend(
                    {
                        mode: this.mode,
                        startHeader: this.startHeader,
                        flagged: this.model.isFlagged(),
                        is_commentable_divided: this.is_commentable_divided,
                        author_display: this.getAuthorDisplay(),
                        cid: this.model.cid,
                        readOnly: $(".discussion-module").data("read-only"),
                    },
                    this.model.attributes
                );
                return edx.HtmlUtils.template($("#thread-show-template").html())(context);
            };
            DiscussionThreadShowView.prototype.render = function () {
                edx.HtmlUtils.setHtml(this.$el, this.renderTemplate());
                this.delegateEvents();
                this.renderAttrs();
                this.$("span.timeago").timeago();
                this.convertMath();
                return this;
            };
            DiscussionThreadShowView.prototype.convertMath = function () {
                DiscussionUtil.convertMath(this.$(".post-body"));
                DiscussionUtil.typesetMathJax(this.$(".post-body"));
            };
            DiscussionThreadShowView.prototype.edit = function (event) {
                return this.trigger("thread:edit", event);
            };
            DiscussionThreadShowView.prototype._delete = function (event) {
                if (is_staff || check_dates()){
                    return this.trigger("thread:_delete", event);
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            return DiscussionThreadShowView;
        })(DiscussionContentShowView);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.DiscussionThreadView = (function (_super) {
            var INITIAL_RESPONSE_PAGE_SIZE, SUBSEQUENT_RESPONSE_PAGE_SIZE;
            __extends(DiscussionThreadView, _super);
            function DiscussionThreadView() {
                var self = this;
                this._delete = function () {
                    return DiscussionThreadView.prototype._delete.apply(self, arguments);
                };
                this.closeEditView = function () {
                    return DiscussionThreadView.prototype.closeEditView.apply(self, arguments);
                };
                this.edit = function () {
                    return DiscussionThreadView.prototype.edit.apply(self, arguments);
                };
                this.endorseThread = function () {
                    return DiscussionThreadView.prototype.endorseThread.apply(self, arguments);
                };
                this.addComment = function () {
                    return DiscussionThreadView.prototype.addComment.apply(self, arguments);
                };
                this.renderAddResponseButton = function () {
                    return DiscussionThreadView.prototype.renderAddResponseButton.apply(self, arguments);
                };
                this.renderResponseToList = function () {
                    return DiscussionThreadView.prototype.renderResponseToList.apply(self, arguments);
                };
                this.renderResponseCountAndPagination = function () {
                    return DiscussionThreadView.prototype.renderResponseCountAndPagination.apply(self, arguments);
                };
                return DiscussionThreadView.__super__.constructor.apply(this, arguments);
            }
            INITIAL_RESPONSE_PAGE_SIZE = 25;
            SUBSEQUENT_RESPONSE_PAGE_SIZE = 100;
            DiscussionThreadView.prototype.events = {
                "click .discussion-submit-post": "submitComment",
                "click .add-response-btn": "scrollToAddResponse",
                "keydown .wmd-button": function (event) {
                    return DiscussionUtil.handleKeypressInToolbar(event);
                },
            };
            DiscussionThreadView.prototype.$ = function (selector) {
                return this.$el.find(selector);
            };
            DiscussionThreadView.prototype.isQuestion = function () {
                return this.model.get("thread_type") === "question";
            };
            DiscussionThreadView.prototype.initialize = function (options) {
                var _ref,
                    self = this;
                DiscussionThreadView.__super__.initialize.call(this);
                this.mode = options.mode || "inline";
                this.context = options.context || "course";
                this.options = _.extend({}, options);
                this.startHeader = options.startHeader;
                if ((_ref = this.mode) !== "tab" && _ref !== "inline") {
                    throw new Error("invalid mode: " + this.mode);
                }
                this.readOnly = $(".discussion-module").data("read-only");
                this.model.collection.on("reset", function (collection) {
                    var id;
                    id = self.model.get("id");
                    if (collection.get(id)) {
                        self.model = collection.get(id);
                    }
                });
                this.is_commentable_divided = options.is_commentable_divided;
                this.createShowView();
                this.responses = new Comments();
                this.loadedResponses = false;
                if (this.isQuestion()) {
                    this.markedAnswers = new Comments();
                }
            };
            DiscussionThreadView.prototype.rerender = function () {
                if (this.showView) {
                    this.showView.undelegateEvents();
                }
                this.undelegateEvents();
                this.$el.empty();
                this.initialize({ mode: this.mode, model: this.model, el: this.el, courseSettings: this.options.courseSettings, topicId: this.topicId });
                return this.render();
            };
            DiscussionThreadView.prototype.renderTemplate = function () {
                var $container, templateData;
                this.template = _.template($("#thread-template").html());
                $container = $("#discussion-container");
                if (!$container.length) {
                    $container = $(".discussion-module");
                }
                templateData = _.extend(this.model.toJSON(), { readOnly: this.readOnly, startHeader: this.startHeader + 1, can_create_comment: $container.data("user-create-comment") });
                return this.template(templateData);
            };
            DiscussionThreadView.prototype.render = function () {
                var self = this;
                var $element = $(this.renderTemplate());
                this.$el.empty();
                this.$el.append($element);
                this.delegateEvents();
                this.renderShowView();
                this.renderAttrs();
                this.$("span.timeago").timeago();
                this.makeWmdEditor("reply-body");
                this.renderAddResponseButton();
                this.responses.on("add", function (response) {
                    return self.renderResponseToList(response, ".js-response-list", {});
                });
                if (this.isQuestion()) {
                    this.markedAnswers.on("add", function (response) {
                        return self.renderResponseToList(response, ".js-marked-answer-list", { collapseComments: true });
                    });
                }
                this.loadInitialResponses();
            };
            DiscussionThreadView.prototype.attrRenderer = $.extend({}, DiscussionContentView.prototype.attrRenderer, {
                closed: function (closed) {
                    this.$(".discussion-reply-new").toggle(!closed);
                    this.$(".comment-form").closest("li").toggle(!closed);
                    this.$(".action-vote").toggle(!closed);
                    this.$(".display-vote").toggle(closed);
                    return this.renderAddResponseButton();
                },
            });
            DiscussionThreadView.prototype.cleanup = function () {
                if (this.responsesRequest && this.responsesRequest.abort) {
                    return this.responsesRequest.abort();
                }
            };
            DiscussionThreadView.prototype.loadResponses = function (responseLimit, $elem, firstLoad) {
                var self = this;
                var form = $elem.parents("article.discussion-article").find("form.discussion-reply-new");
                form.hide();
                this.responsesRequest = DiscussionUtil.safeAjax({
                    url: DiscussionUtil.urlFor("retrieve_single_thread", this.model.get("commentable_id"), this.model.id),
                    data: { resp_skip: this.responses.size(), resp_limit: responseLimit || void 0 },
                    $elem: $elem,
                    $loading: $elem,
                    takeFocus: false,
                    complete: function () {
                        self.responsesRequest = null;
                    },
                    success: function (data) {
                        Content.loadContentInfos(data.annotated_content_info);
                        if (self.isQuestion()) {
                            self.markedAnswers.add(data.content.endorsed_responses);
                        }
                        self.responses.add(self.isQuestion() ? data.content.non_endorsed_responses : data.content.children);
                        self.renderResponseCountAndPagination(self.isQuestion() ? data.content.non_endorsed_resp_total : data.content.resp_total);
                        self.trigger("thread:responses:rendered");
                        self.loadedResponses = true;
                    },
                    error: function (xhr, textStatus) {
                        if (textStatus === "abort") {
                            return;
                        }
                        if (xhr.status === 404) {
                            DiscussionUtil.discussionAlert(gettext("Error"), gettext("The post you selected has been deleted."));
                        } else if (firstLoad) {
                            DiscussionUtil.discussionAlert(gettext("Error"), gettext("Responses could not be loaded. Refresh the page and try again."));
                        } else {
                            DiscussionUtil.discussionAlert(gettext("Error"), gettext("Additional responses could not be loaded. Refresh the page and try again."));
                        }
                    },
                });
            };
            DiscussionThreadView.prototype.loadInitialResponses = function () {
                return this.loadResponses(INITIAL_RESPONSE_PAGE_SIZE, this.$el.find(".js-response-list"), true);
            };
            DiscussionThreadView.prototype.renderResponseCountAndPagination = function (responseTotal) {
                var buttonText,
                    $loadMoreButton,
                    responseCountFormat,
                    responseLimit,
                    responsePagination,
                    responsesRemaining,
                    showingResponsesText,
                    self = this;
                if (this.isQuestion() && this.markedAnswers.length !== 0) {
                    responseCountFormat = ngettext("{numResponses} other response", "{numResponses} other responses", responseTotal);
                    if (responseTotal === 0) {
                        this.$el.find(".response-count").hide();
                    }
                } else {
                    responseCountFormat = ngettext("{numResponses} response", "{numResponses} responses", responseTotal);
                }
                this.$el.find(".response-count").text(edx.StringUtils.interpolate(responseCountFormat, { numResponses: responseTotal }, true));
                responsePagination = this.$el.find(".response-pagination");
                responsePagination.empty();
                if (responseTotal > 0) {
                    responsesRemaining = responseTotal - this.responses.size();
                    if (responsesRemaining === 0) {
                        showingResponsesText = gettext("Showing all responses");
                    } else {
                        showingResponsesText = edx.StringUtils.interpolate(ngettext("Showing first response", "Showing first {numResponses} responses", this.responses.size()), { numResponses: this.responses.size() }, true);
                    }
                    responsePagination.append($("<span>").addClass("response-display-count").text(showingResponsesText));
                    if (responsesRemaining > 0) {
                        if (responsesRemaining < SUBSEQUENT_RESPONSE_PAGE_SIZE) {
                            responseLimit = null;
                            buttonText = gettext("Load all responses");
                        } else {
                            responseLimit = SUBSEQUENT_RESPONSE_PAGE_SIZE;
                            buttonText = edx.StringUtils.interpolate(gettext("Load next {numResponses} responses"), { numResponses: responseLimit }, true);
                        }
                        $loadMoreButton = $("<button>").addClass("btn-neutral").addClass("load-response-button").text(buttonText);
                        $loadMoreButton.click(function () {
                            return self.loadResponses(responseLimit, $loadMoreButton);
                        });
                        return responsePagination.append($loadMoreButton);
                    }
                } else {
                    this.$el.find(".add-response").show();
                }
            };
            DiscussionThreadView.prototype.renderResponseToList = function (response, listSelector, options) {
                var view;
                response.set("thread", this.model);
                view = new ThreadResponseView($.extend({ model: response, startHeader: this.startHeader + 1 }, options));
                view.on("comment:add", this.addComment);
                view.on("comment:endorse", this.endorseThread);
                view.render();
                this.$el.find(listSelector).append(view.el);
                view.afterInsert();
                if (options.focusAddedResponse) {
                    this.focusToTheAddedResponse(view.el);
                }
                DiscussionUtil.typesetMathJax(view.$el);
                return view;
            };
            DiscussionThreadView.prototype.renderAddResponseButton = function () {
                if (this.model.hasResponses() && this.model.can("can_reply") && !this.model.get("closed")) {
                    return this.$el.find(".add-response").show();
                } else {
                    return this.$el.find(".add-response").hide();
                }
            };
            DiscussionThreadView.prototype.scrollToAddResponse = function (event) {
                var form;
                event.preventDefault();
                if (is_staff || check_dates()){
                    form = $(event.target).parents("article.discussion-article").find("form.discussion-reply-new");
                    form.find(".wmd-panel textarea").focus()
                    if(form[0].style.display == 'none'){
                        form.show();
                    }
                    else{
                        form.hide();
                    }
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
                //$("html, body").scrollTop(form.offset().top);
                return ;
            };
            DiscussionThreadView.prototype.addComment = function () {
                return this.model.comment();
            };
            DiscussionThreadView.prototype.endorseThread = function () {
                return this.model.set("endorsed", this.$el.find(".action-answer.is-checked").length > 0);
            };
            DiscussionThreadView.prototype.submitComment = function (event) {
                var body, comment, url, view;
                event.preventDefault();
                if (is_staff || check_dates()){
                    url = this.model.urlFor("reply");
                    body = this.getWmdContent("reply-body");
                    if (!body.trim().length) {
                        return;
                    }
                    this.setWmdContent("reply-body", "");
                    comment = new Comment({ body: body, created_at: new Date().toISOString(), username: window.user.get("username"), votes: { up_count: 0 }, abuse_flaggers: [], endorsed: false, user_id: window.user.get("id") });
                    comment.set("thread", this.model.get("thread"));
                    view = this.renderResponseToList(comment, ".js-response-list", { focusAddedResponse: true });
                    this.model.addComment();
                    this.renderAddResponseButton();
                    return DiscussionUtil.safeAjax({
                        $elem: $(event.target),
                        url: url,
                        type: "POST",
                        dataType: "json",
                        data: { body: body },
                        success: function (data) {
                            comment.updateInfo(data.annotated_content_info);
                            comment.set(data.content);
                            DiscussionUtil.typesetMathJax(view.$el.find(".response-body"));
                        },
                    });
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            DiscussionThreadView.prototype.focusToTheAddedResponse = function (list) {
                return $(list).attr("tabindex", "-1").focus();
            };
            DiscussionThreadView.prototype.edit = function () {
                this.createEditView();
                return this.renderEditView();
            };
            DiscussionThreadView.prototype.createEditView = function () {
                if (this.showView) {
                    this.showView.undelegateEvents();
                    this.showView.$el.empty();
                    this.showView = null;
                }
                this.editView = new DiscussionThreadEditView({
                    container: this.$(".thread-content-wrapper"),
                    model: this.model,
                    mode: this.mode,
                    context: this.context,
                    startHeader: this.startHeader,
                    course_settings: this.options.courseSettings,
                });
                this.editView.bind("thread:updated thread:cancel_edit", this.closeEditView);
                return this.editView.bind("comment:endorse", this.endorseThread);
            };
            DiscussionThreadView.prototype.renderSubView = function (view) {
                view.setElement(this.$(".thread-content-wrapper"));
                view.render();
                return view.delegateEvents();
            };
            DiscussionThreadView.prototype.renderEditView = function () {
                return this.editView.render();
            };
            DiscussionThreadView.prototype.createShowView = function () {
                this.showView = new DiscussionThreadShowView({ model: this.model, mode: this.mode, startHeader: this.startHeader, is_commentable_divided: this.is_commentable_divided });
                this.showView.bind("thread:_delete", this._delete);
                return this.showView.bind("thread:edit", this.edit);
            };
            DiscussionThreadView.prototype.renderShowView = function () {
                return this.renderSubView(this.showView);
            };
            DiscussionThreadView.prototype.closeEditView = function () {
                this.createShowView();
                this.renderShowView();
                this.renderAttrs();
                return this.$el.find(".post-extended-content").show();
            };
            DiscussionThreadView.prototype._delete = function (event) {
                var $elem, url;
                if (is_staff || check_dates()){
                    url = this.model.urlFor("_delete");
                    if (!this.model.can("can_delete")) {
                        return;
                    }
                    if (!confirm(gettext("Are you sure you want to delete this post?"))) {
                        return;
                    }
                    this.model.remove();
                    this.showView.undelegateEvents();
                    this.undelegateEvents();
                    this.$el.empty();
                    $elem = $(event.target);
                    return DiscussionUtil.safeAjax({ $elem: $elem, url: url, type: "POST" });
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            return DiscussionThreadView;
        })(DiscussionContentView);
    }
}.call(window));
(function () {
    "use strict";
    if (Backbone) {
        this.DiscussionTopicMenuView = Backbone.View.extend({
            events: { "change .post-topic": "handleTopicEvent" },
            attributes: { class: "post-field" },
            initialize: function (options) {
                this.course_settings = options.course_settings;
                this.currentTopicId = options.topicId;
                this.group_name = options.group_name;
                _.bindAll(this, "handleTopicEvent");
                return this;
            },
            render: function () {
                var $general,
                    context = _.clone(this.course_settings.attributes);
                context.topics_html = this.renderCategoryMap(this.course_settings.get("category_map"));
                edx.HtmlUtils.setHtml(this.$el, edx.HtmlUtils.template($("#topic-template").html())(context));
                $general = this.$(".post-topic option:contains(General)");
                if (this.getCurrentTopicId()) {
                    this.setTopic(this.$(".post-topic option").filter('[data-discussion-id="' + this.getCurrentTopicId() + '"]'));
                } else if ($general.length > 0) {
                    this.setTopic($general.first());
                } else {
                    this.setTopic(this.$(".post-topic option").first());
                }
                return this.$el;
            },
            renderCategoryMap: function (map) {
                var categoryTemplate = edx.HtmlUtils.template($("#new-post-menu-category-template").html()),
                    entryTemplate = edx.HtmlUtils.template($("#new-post-menu-entry-template").html()),
                    mappedCategorySnippets = _.map(
                        map.children,
                        function (child) {
                            var entry,
                                html = "",
                                name = child[0],
                                type = child[1];
                            if (_.has(map.entries, name) && type === "entry") {
                                entry = map.entries[name];
                                html = entryTemplate({ text: name, id: entry.id, is_divided: entry.is_divided });
                            } else {
                                html = categoryTemplate({ text: name, entries: this.renderCategoryMap(map.subcategories[name]) });
                            }
                            return html;
                        },
                        this
                    );
                return edx.HtmlUtils.joinHtml.apply(null, mappedCategorySnippets);
            },
            handleTopicEvent: function (event) {
                this.setTopic($("option:selected", event.target));
                return this;
            },
            setTopic: function ($target) {
                if ($target.data("discussion-id")) {
                    this.topicText = this.getFullTopicName($target);
                    this.currentTopicId = $target.data("discussion-id");
                    $target.prop("selected", true);
                    this.trigger("thread:topic_change", $target);
                }
                return this;
            },
            getCurrentTopicId: function () {
                return this.currentTopicId;
            },
            getFullTopicName: function (topicElement) {
                var name;
                if (topicElement) {
                    name = topicElement.html();
                    _.each(topicElement.parents("optgroup"), function (item) {
                        name = $(item).attr("label") + " / " + name;
                    });
                    return name;
                } else {
                    return this.topicText;
                }
            },
        });
    }
}.call(this));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.NewPostView = (function (_super) {
            __extends(NewPostView, _super);
            function NewPostView() {
                var self = this;
                this.updateStyles = function () {
                    return NewPostView.prototype.updateStyles.apply(self, arguments);
                };
                this.resetForm = function () {
                    return NewPostView.prototype.resetForm.apply(self, arguments);
                };
                return NewPostView.__super__.constructor.apply(this, arguments);
            }
            NewPostView.prototype.initialize = function (options) {
                var _ref;
                this.mode = options.mode || "inline";
                this.startHeader = options.startHeader;
                if ((_ref = this.mode) !== "tab" && _ref !== "inline") {
                    throw new Error("invalid mode: " + this.mode);
                }
                this.course_settings = options.course_settings;
                this.is_commentable_divided = options.is_commentable_divided;
                this.user_group_id = options.user_group_id;
                this.topicId = options.topicId;
                this.discussionBoardView = options.discussionBoardView;
            };
            NewPostView.prototype.render = function () {
                var context, threadTypeTemplate;
                context = _.clone(this.course_settings.attributes);
                _.extend(context, {
                    group_options: this.getGroupOptions(),
                    is_commentable_divided: this.is_commentable_divided,
                    is_discussion_division_enabled: this.course_settings.get("is_discussion_division_enabled"),
                    mode: this.mode,
                    startHeader: this.startHeader,
                    form_id: this.mode + (this.topicId ? "-" + this.topicId : ""),
                });
                edx.HtmlUtils.setHtml(this.$el, edx.HtmlUtils.template($("#new-post-template").html())(context));
                threadTypeTemplate = edx.HtmlUtils.template($("#thread-type-template").html());
                if ($(".js-group-select").prop("disabled")) {
                    $(".group-selector-wrapper").addClass("disabled");
                }
                this.addField(threadTypeTemplate({ form_id: _.uniqueId("form-") }));
                if (this.isTabMode()) {
                    this.topicView = new DiscussionTopicMenuView({ topicId: this.topicId, course_settings: this.course_settings, group_name: this.getGroupName() });
                    this.topicView.on("thread:topic_change", this.toggleGroupDropdown);
                    if (this.course_settings.get("is_discussion_division_enabled")) {
                        this.topicView.on("thread:topic_change", this.updateVisibilityMessage);
                    }
                    this.addField(edx.HtmlUtils.HTML(this.topicView.render()));
                } else {
                    this.group_name = this.getGroupName();
                    this.updateVisibilityMessage(null, this.is_commentable_divided);
                }
                return DiscussionUtil.makeWmdEditor(this.$el, $.proxy(this.$, this), "js-post-body", 3);
            };
            NewPostView.prototype.addField = function (fieldView) {
                return edx.HtmlUtils.append(this.$(".forum-new-post-form-wrapper"), fieldView);
            };
            NewPostView.prototype.isTabMode = function () {
                return this.mode === "tab";
            };
            NewPostView.prototype.getGroupOptions = function () {
                var userGroupId;
                if (this.course_settings.get("is_discussion_division_enabled") && DiscussionUtil.isPrivilegedUser()) {
                    userGroupId = $("#discussion-container").data("user-group-id");
                    return _.map(this.course_settings.get("groups"), function (group) {
                        return { value: group.id, text: group.name, selected: group.id === userGroupId };
                    });
                } else {
                    return null;
                }
            };
            NewPostView.prototype.getGroupName = function () {
                var userGroupId;
                var group;
                var groupName = null;
                if (this.course_settings.get("is_discussion_division_enabled")) {
                    userGroupId = $("#discussion-container").data("user-group-id");
                    if (!userGroupId) {
                        userGroupId = this.user_group_id;
                    }
                    group = this.course_settings.get("groups").find(function (courseSettingsGroup) {
                        return courseSettingsGroup.id === String(userGroupId);
                    });
                    if (group) {
                        groupName = group.name;
                    }
                }
                return groupName;
            };
            NewPostView.prototype.events = {
                "keypress .forum-new-post-form input:not(.wmd-input)": function (event) {
                    return DiscussionUtil.ignoreEnterKey(event);
                },
                "submit .forum-new-post-form": "createPost",
                "change .post-option-input": "postOptionChange",
                "change .js-group-select": "groupOptionChange",
                "click .cancel": "cancel",
                "click  .add-post-cancel": "cancel",
                "reset .forum-new-post-form": "updateStyles",
                "keydown .wmd-button": function (event) {
                    return DiscussionUtil.handleKeypressInToolbar(event);
                },
            };
            NewPostView.prototype.toggleGroupDropdown = function ($target) {
                if ($target.data("divided")) {
                    $(".js-group-select").prop("disabled", false);
                    $(".js-group-select").val("").prop("selected", true);
                    return $(".group-selector-wrapper").removeClass("disabled");
                } else {
                    $(".js-group-select").val("").prop("disabled", true);
                    return $(".group-selector-wrapper").addClass("disabled");
                }
            };
            NewPostView.prototype.updateVisibilityMessage = function ($target, forceDivided) {
                var $visEl = $("#wrapper-visibility-message");
                var visTemplate = edx.HtmlUtils.template($("#new-post-visibility-template").html());
                var groupName = null;
                if (($target && $target.data("divided")) || forceDivided) {
                    groupName = this.group_name;
                }
                edx.HtmlUtils.setHtml($visEl, visTemplate({ group_name: groupName }));
            };
            NewPostView.prototype.postOptionChange = function (event) {
                var $optionElem, $target;
                $target = $(event.target);
                $optionElem = $target.closest(".post-option");
                if ($target.is(":checked")) {
                    return $optionElem.addClass("is-enabled");
                } else {
                    return $optionElem.removeClass("is-enabled");
                }
            };
            NewPostView.prototype.createPost = function (event) {
                var anonymous,
                    anonymousToPeers,
                    body,
                    follow,
                    group,
                    threadType,
                    title,
                    topicId,
                    url,
                    self = this;
                event.preventDefault();
                if (is_staff || check_dates()){
                    threadType = this.$(".input-radio:checked").val();
                    title = this.$(".js-post-title").val();
                    body = this.$(".js-post-body").find(".wmd-input").val();
                    group = this.$(".js-group-select option:selected").attr("value");
                    anonymous = false || this.$("input[name=anonymous]").is(":checked");
                    anonymousToPeers = false || this.$("input[name=anonymous_to_peers]").is(":checked");
                    follow = false || this.$("input[name=follow]").is(":checked");
                    topicId = this.isTabMode() ? this.topicView.getCurrentTopicId() : this.topicId;
                    url = DiscussionUtil.urlFor("create_thread", topicId);
                    return DiscussionUtil.safeAjax({
                        $elem: $(event.target),
                        $loading: event ? $(event.target) : void 0,
                        url: url,
                        type: "POST",
                        dataType: "json",
                        data: { thread_type: threadType, title: title, body: body, anonymous: anonymous, anonymous_to_peers: anonymousToPeers, auto_subscribe: follow, group_id: group },
                        error: DiscussionUtil.formErrorHandler(this.$(".post-errors")),
                        success: function (response) {
                            var thread, discussionBreadcrumbsModel;
                            thread = new Thread(response.content);
                            if (self.discussionBoardView) {
                                discussionBreadcrumbsModel = self.discussionBoardView.breadcrumbs.model;
                                if (discussionBreadcrumbsModel.get("contents").length) {
                                    discussionBreadcrumbsModel.set("contents", self.topicView.topicText.split("/"));
                                }
                                self.discussionBoardView.discussionThreadListView.discussionIds = self.topicView.currentTopicId;
                            }
                            self.$el.addClass("is-hidden");
                            self.resetForm();
                            self.trigger("newPost:createPost");
                            return self.collection.add(thread);
                        },
                    });
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            NewPostView.prototype.formModified = function () {
                var postBodyHasContent = this.$(".js-post-body").find(".wmd-input").val() !== "",
                    titleHasContent = this.$(".js-post-title").val() !== "";
                return postBodyHasContent || titleHasContent;
            };
            NewPostView.prototype.cancel = function (event) {
                event.preventDefault();
                if (this.formModified()) {
                    if (!confirm(gettext("Your post will be discarded."))) {
                        return;
                    }
                }
                this.trigger("newPost:cancel");
                this.resetForm();
            };
            NewPostView.prototype.resetForm = function () {
                var $general;
                this.$(".forum-new-post-form")[0].reset();
                DiscussionUtil.clearFormErrors(this.$(".post-errors"));
                this.$(".wmd-preview").html("");
                if (this.isTabMode()) {
                    $general = this.$(".post-topic option:contains(General)");
                    this.topicView.setTopic($general || this.$("button.topic-title").first());
                }
            };
            NewPostView.prototype.updateStyles = function () {
                var self = this;
                return setTimeout(function () {
                    return self.$(".post-option-input").trigger("change");
                }, 1);
            };
            NewPostView.prototype.groupOptionChange = function (event) {
                var $target = $(event.target),
                    data = $target.data();
                this.group_name = this.$(".js-group-select option:selected").text();
                data.divided = true;
                this.updateVisibilityMessage($target);
            };
            return NewPostView;
        })(Backbone.View);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.ResponseCommentEditView = (function (_super) {
            __extends(ResponseCommentEditView, _super);
            function ResponseCommentEditView(options) {
                this.options = options;
                return ResponseCommentEditView.__super__.constructor.apply(this, arguments);
            }
            ResponseCommentEditView.prototype.events = { "click .post-update": "update", "click .post-cancel": "cancel_edit" };
            ResponseCommentEditView.prototype.$ = function (selector) {
                return this.$el.find(selector);
            };
            ResponseCommentEditView.prototype.initialize = function () {
                return ResponseCommentEditView.__super__.initialize.call(this);
            };
            ResponseCommentEditView.prototype.render = function () {
                var context = $.extend({ mode: this.options.mode, startHeader: this.options.startHeader }, this.model.attributes);
                this.template = edx.HtmlUtils.template($("#response-comment-edit-template").html());
                edx.HtmlUtils.setHtml(this.$el, this.template(context));
                this.delegateEvents();
                DiscussionUtil.makeWmdEditor(this.$el, $.proxy(this.$, this), "edit-comment-body", 2);
                var text = this.$el.find('.eol-text-limit')[0].textContent;
                var span_limit = this.$el.find('#eol-limit-character')[0];
                span_limit.textContent = limitCharacter - text.length;
                span_limit.textContent = span_limit.textContent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                return this;
            };
            ResponseCommentEditView.prototype.update = function (event) {
                if (is_staff || check_dates()){
                    return this.trigger("comment:update", event);
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            ResponseCommentEditView.prototype.cancel_edit = function (event) {
                return this.trigger("comment:cancel_edit", event);
            };
            return ResponseCommentEditView;
        })(Backbone.View);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.ResponseCommentShowView = (function (_super) {
            __extends(ResponseCommentShowView, _super);
            function ResponseCommentShowView() {
                var self = this;
                this.edit = function () {
                    return ResponseCommentShowView.prototype.edit.apply(self, arguments);
                };
                this._delete = function () {
                    return ResponseCommentShowView.prototype._delete.apply(self, arguments);
                };
                return ResponseCommentShowView.__super__.constructor.apply(this, arguments);
            }
            ResponseCommentShowView.prototype.tagName = "li";
            ResponseCommentShowView.prototype.render = function () {
                var template = edx.HtmlUtils.template($("#response-comment-show-template").html());
                var context = _.extend({ cid: this.model.cid, author_display: this.getAuthorDisplay(), readOnly: $(".discussion-module").data("read-only") }, this.model.attributes);
                edx.HtmlUtils.setHtml(this.$el, template(context));
                this.delegateEvents();
                this.renderAttrs();
                this.$el.find(".timeago").timeago();
                this.convertMath();
                this.addReplyLink();
                return this;
            };
            ResponseCommentShowView.prototype.addReplyLink = function () {
                var html, name;
                if (this.model.hasOwnProperty("parent")) {
                    name = this.model.parent.get("username") || gettext("anonymous");
                    html = edx.HtmlUtils.interpolateHtml(edx.HtmlUtils.HTML("<a href='#comment_{parent_id}'>@{name}</a>:  "), { parent_id: this.model.parent.id, name: name });
                    return edx.HtmlUtils.prepend(this.$(".response-body p:first"), html);
                }
            };
            ResponseCommentShowView.prototype.convertMath = function () {
                DiscussionUtil.convertMath(this.$el.find(".response-body"));
                DiscussionUtil.typesetMathJax(this.$el.find(".response-body"));
            };
            ResponseCommentShowView.prototype._delete = function (event) {
                if (is_staff || check_dates()){
                    return this.trigger("comment:_delete", event);
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            ResponseCommentShowView.prototype.edit = function (event) {
                return this.trigger("comment:edit", event);
            };
            return ResponseCommentShowView;
        })(DiscussionContentShowView);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.ResponseCommentView = (function (_super) {
            __extends(ResponseCommentView, _super);
            function ResponseCommentView() {
                var self = this;
                this.update = function () {
                    return ResponseCommentView.prototype.update.apply(self, arguments);
                };
                this.edit = function () {
                    return ResponseCommentView.prototype.edit.apply(self, arguments);
                };
                this.cancelEdit = function () {
                    return ResponseCommentView.prototype.cancelEdit.apply(self, arguments);
                };
                this._delete = function () {
                    return ResponseCommentView.prototype._delete.apply(self, arguments);
                };
                return ResponseCommentView.__super__.constructor.apply(this, arguments);
            }
            ResponseCommentView.prototype.tagName = "li";
            ResponseCommentView.prototype.$ = function (selector) {
                return this.$el.find(selector);
            };
            ResponseCommentView.prototype.initialize = function (options) {
                this.startHeader = options.startHeader;
                return ResponseCommentView.__super__.initialize.call(this);
            };
            ResponseCommentView.prototype.render = function () {
                this.renderShowView();
                return this;
            };
            ResponseCommentView.prototype.renderSubView = function (view) {
                view.setElement(this.$el);
                view.render();
                return view.delegateEvents();
            };
            ResponseCommentView.prototype.renderShowView = function () {
                if (!this.showView) {
                    if (this.editView) {
                        this.editView.undelegateEvents();
                        this.editView.$el.empty();
                        this.editView = null;
                    }
                    this.showView = new ResponseCommentShowView({ model: this.model });
                    this.showView.bind("comment:_delete", this._delete);
                    this.showView.bind("comment:edit", this.edit);
                    return this.renderSubView(this.showView);
                }
            };
            ResponseCommentView.prototype.renderEditView = function () {
                if (!this.editView) {
                    if (this.showView) {
                        this.showView.undelegateEvents();
                        this.showView.$el.empty();
                        this.showView = null;
                    }
                    this.editView = new ResponseCommentEditView({ model: this.model, startHeader: this.startHeader });
                    this.editView.bind("comment:update", this.update);
                    this.editView.bind("comment:cancel_edit", this.cancelEdit);
                    return this.renderSubView(this.editView);
                }
            };
            ResponseCommentView.prototype._delete = function (event) {
                var $elem,
                    url,
                    self = this;
                event.preventDefault();
                if (is_staff || check_dates()){
                    if (!this.model.can("can_delete")) {
                        return;
                    }
                    if (!confirm(gettext("Are you sure you want to delete this comment?"))) {
                        return;
                    }
                    url = this.model.urlFor("_delete");
                    $elem = $(event.target);
                    return DiscussionUtil.safeAjax({
                        $elem: $elem,
                        url: url,
                        type: "POST",
                        success: function () {
                            self.model.remove();
                            return self.$el.remove();
                        },
                        error: function () {
                            return DiscussionUtil.discussionAlert(gettext("Error"), gettext("This comment could not be deleted. Refresh the page and try again."));
                        },
                    });
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            ResponseCommentView.prototype.cancelEdit = function (event) {
                this.trigger("comment:cancel_edit", event);
                return this.renderShowView();
            };
            ResponseCommentView.prototype.edit = function (event) {
                this.trigger("comment:edit", event);
                return this.renderEditView();
            };
            ResponseCommentView.prototype.update = function (event) {
                var newBody,
                    url,
                    self = this;
                newBody = this.editView.$(".edit-comment-body textarea").val();
                url = DiscussionUtil.urlFor("update_comment", this.model.id);
                return DiscussionUtil.safeAjax({
                    $elem: $(event.target),
                    $loading: $(event.target),
                    url: url,
                    type: "POST",
                    dataType: "json",
                    data: { body: newBody },
                    error: DiscussionUtil.formErrorHandler(this.$(".edit-comment-form-errors")),
                    success: function () {
                        self.model.set("body", newBody);
                        return self.cancelEdit();
                    },
                });
            };
            return ResponseCommentView;
        })(DiscussionContentView);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.ThreadResponseEditView = (function (_super) {
            __extends(ThreadResponseEditView, _super);
            function ThreadResponseEditView() {
                return ThreadResponseEditView.__super__.constructor.apply(this, arguments);
            }
            ThreadResponseEditView.prototype.events = { "click .post-update": "update", "click .post-cancel": "cancel_edit" };
            ThreadResponseEditView.prototype.$ = function (selector) {
                return this.$el.find(selector);
            };
            ThreadResponseEditView.prototype.initialize = function (options) {
                this.options = options;
                return ThreadResponseEditView.__super__.initialize.call(this);
            };
            ThreadResponseEditView.prototype.render = function () {
                var context = $.extend({ mode: this.options.mode, startHeader: this.options.startHeader }, this.model.attributes);
                this.template = edx.HtmlUtils.template($("#thread-response-edit-template").html());
                edx.HtmlUtils.setHtml(this.$el, this.template(context));
                this.delegateEvents();
                DiscussionUtil.makeWmdEditor(this.$el, $.proxy(this.$, this), "edit-post-body", 1);
                var text = this.$el.find('.eol-text-limit')[0].textContent;
                var span_limit = this.$el.find('#eol-limit-character')[0];
                span_limit.textContent = limitCharacter - text.length;
                span_limit.textContent = span_limit.textContent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                return this;
            };
            ThreadResponseEditView.prototype.update = function (event) {
                if (is_staff || check_dates()){
                    return this.trigger("response:update", event);
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            ThreadResponseEditView.prototype.cancel_edit = function (event) {
                return this.trigger("response:cancel_edit", event);
            };
            return ThreadResponseEditView;
        })(Backbone.View);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.ThreadResponseShowView = (function (_super) {
            __extends(ThreadResponseShowView, _super);
            function ThreadResponseShowView() {
                return ThreadResponseShowView.__super__.constructor.apply(this, arguments);
            }
            ThreadResponseShowView.prototype.initialize = function () {
                ThreadResponseShowView.__super__.initialize.call(this);
                return this.listenTo(this.model, "change", this.render);
            };
            ThreadResponseShowView.prototype.renderTemplate = function () {
                var template = edx.HtmlUtils.template($("#thread-response-show-template").html()),
                    context = _.extend({ cid: this.model.cid, author_display: this.getAuthorDisplay(), endorser_display: this.getEndorserDisplay(), readOnly: $(".discussion-module").data("read-only") }, this.model.attributes);
                return template(context);
            };
            ThreadResponseShowView.prototype.render = function () {
                edx.HtmlUtils.setHtml(this.$el, this.renderTemplate());
                this.delegateEvents();
                this.renderAttrs();
                this.$el.find(".posted-details .timeago").timeago();
                this.convertMath();
                return this;
            };
            ThreadResponseShowView.prototype.convertMath = function () {
                DiscussionUtil.convertMath(this.$(".response-body"));
            };
            ThreadResponseShowView.prototype.edit = function (event) {
                return this.trigger("response:edit", event);
            };
            ThreadResponseShowView.prototype._delete = function (event) {
                if (is_staff || check_dates()){
                    return this.trigger("response:_delete", event);
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            return ThreadResponseShowView;
        })(DiscussionContentShowView);
    }
}.call(window));
(function () {
    "use strict";
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) {
                    child[key] = parent[key];
                }
            }
            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    if (typeof Backbone !== "undefined" && Backbone !== null) {
        this.ThreadResponseView = (function (_super) {
            __extends(ThreadResponseView, _super);
            function ThreadResponseView() {
                var self = this;
                this.update = function () {
                    return ThreadResponseView.prototype.update.apply(self, arguments);
                };
                this.edit = function () {
                    return ThreadResponseView.prototype.edit.apply(self, arguments);
                };
                this.cancelEdit = function () {
                    return ThreadResponseView.prototype.cancelEdit.apply(self, arguments);
                };
                this._delete = function () {
                    return ThreadResponseView.prototype._delete.apply(self, arguments);
                };
                this.renderComment = function () {
                    return ThreadResponseView.prototype.renderComment.apply(self, arguments);
                };
                return ThreadResponseView.__super__.constructor.apply(this, arguments);
            }
            ThreadResponseView.prototype.tagName = "li";
            ThreadResponseView.prototype.className = "forum-response";
            ThreadResponseView.prototype.events = { "click .discussion-submit-comment": "submitComment", "focus .wmd-input": "showEditorChrome" };
            ThreadResponseView.prototype.$ = function (selector) {
                return this.$el.find(selector);
            };
            ThreadResponseView.prototype.initialize = function (options) {
                this.startHeader = options.startHeader;
                this.collapseComments = options.collapseComments;
                this.createShowView();
                this.readOnly = $(".discussion-module").data("read-only");
            };
            ThreadResponseView.prototype.renderTemplate = function () {
                var $container, templateData, _ref;
                this.template = _.template($("#thread-response-template").html());
                $container = $("#discussion-container");
                if (!$container.length) {
                    $container = $(".discussion-module");
                }
                templateData = _.extend(this.model.toJSON(), { wmdId: typeof this.model.id !== "undefined" ? this.model.id : new Date().getTime(), create_sub_comment: $container.data("user-create-subcomment"), readOnly: this.readOnly });
                return this.template(templateData);
            };
            ThreadResponseView.prototype.render = function () {
                this.$el.addClass("response_" + this.model.get("id"));
                edx.HtmlUtils.setHtml(this.$el, edx.HtmlUtils.HTML(this.renderTemplate()));
                this.delegateEvents();
                this.renderShowView();
                this.renderAttrs();
                if (this.model.get("thread").get("closed")) {
                    this.hideCommentForm();
                }
                this.renderComments();
                return this;
            };
            ThreadResponseView.prototype.afterInsert = function () {
                this.makeWmdEditor("comment-body");
                return this.hideEditorChrome();
            };
            ThreadResponseView.prototype.hideEditorChrome = function () {
                this.$(".wmd-button-row").hide();
                this.$(".wmd-preview-container").hide();
                this.$(".wmd-input").css({ height: "35px", padding: "5px" });
                this.$(".eol-characters-span").hide();
                return this.$(".comment-post-control").hide();
            };
            ThreadResponseView.prototype.showEditorChrome = function () {
                this.$(".wmd-button-row").show();
                this.$(".wmd-preview-container").show();
                this.$(".comment-post-control").show();
                this.$(".eol-characters-span").show();
                return this.$(".wmd-input").css({ height: "125px", padding: "10px" });
            };
            ThreadResponseView.prototype.renderComments = function () {
                var collectComments,
                    comments,
                    self = this;
                comments = new Comments();
                this.commentViews = [];
                comments.comparator = function (comment) {
                    return comment.get("created_at");
                };
                collectComments = function (comment) {
                    var children;
                    comments.add(comment);
                    children = new Comments(comment.get("children"));
                    return children.each(function (child) {
                        child.parent = comment;
                        return collectComments(child);
                    });
                };
                this.model.get("comments").each(collectComments);
                comments.each(function (comment) {
                    return self.renderComment(comment, false, null);
                });
                if (this.collapseComments && comments.length) {
                    this.$(".comments").hide();
                    return this.$(".action-show-comments").on("click", function (event) {
                        event.preventDefault();
                        self.$(".action-show-comments").hide();
                        return self.$(".comments").show();
                    });
                } else {
                    return this.$(".action-show-comments").hide();
                }
            };
            ThreadResponseView.prototype.renderComment = function (comment) {
                var view,
                    self = this;
                comment.set("thread", this.model.get("thread"));
                view = new ResponseCommentView({ model: comment, startHeader: this.startHeader });
                view.render();
                if (this.readOnly) {
                    this.$el.find(".comments").append(view.el);
                } else {
                    this.$el.find(".comments .new-comment").before(view.el);
                }
                view.bind("comment:edit", function (event) {
                    if (self.editView) {
                        self.cancelEdit(event);
                    }
                    self.cancelCommentEdits();
                    return self.hideCommentForm();
                });
                view.bind("comment:cancel_edit", function () {
                    return self.showCommentForm();
                });
                this.commentViews.push(view);
                this.focusToTheCommentResponse(view.$el.closest(".forum-response"));
                DiscussionUtil.typesetMathJax(view.$el.find(".response-body"));
                return view;
            };
            ThreadResponseView.prototype.submitComment = function (event) {
                var body, comment, url, view;
                event.preventDefault();
                if (is_staff || check_dates()){
                    url = this.model.urlFor("reply");
                    body = this.getWmdContent("comment-body");
                    if (!body.trim().length) {
                        return;
                    }
                    this.setWmdContent("comment-body", "");
                    comment = new Comment({ body: body, created_at: new Date().toISOString(), username: window.user.get("username"), abuse_flaggers: [], user_id: window.user.get("id"), id: "unsaved" });
                    view = this.renderComment(comment);
                    this.hideEditorChrome();
                    this.trigger("comment:add", comment);
                    return DiscussionUtil.safeAjax({
                        $elem: $(event.target),
                        url: url,
                        type: "POST",
                        dataType: "json",
                        data: { body: body },
                        success: function (response) {
                            comment.set(response.content);
                            comment.updateInfo(response.annotated_content_info);
                            return view.render();
                        },
                    });
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            ThreadResponseView.prototype.focusToTheCommentResponse = function (list) {
                return $(list).attr("tabindex", "-1").focus();
            };
            ThreadResponseView.prototype._delete = function (event) {
                var $elem, url;
                event.preventDefault();
                if (is_staff || check_dates()){
                    if (!this.model.can("can_delete")) {
                        return;
                    }
                    if (!confirm(gettext("Are you sure you want to delete this response?"))) {
                        return;
                    }
                    url = this.model.urlFor("_delete");
                    this.model.remove();
                    this.$el.remove();
                    $elem = $(event.target);
                    return DiscussionUtil.safeAjax({ $elem: $elem, url: url, type: "POST" });
                }
                else {
                    alert('El Foro ha finalizado.');
                    document.getElementsByClassName('discussion-module-date')[0].style.display = 'none';
                    document.getElementsByClassName('discussion-module-date-finished')[0].style.display = 'block';
                }
            };
            ThreadResponseView.prototype.createEditView = function () {
                if (this.showView) {
                    this.showView.$el.empty();
                }
                if (this.editView) {
                    this.editView.model = this.model;
                } else {
                    this.editView = new ThreadResponseEditView({ model: this.model, startHeader: this.startHeader });
                    this.editView.bind("response:update", this.update);
                    return this.editView.bind("response:cancel_edit", this.cancelEdit);
                }
            };
            ThreadResponseView.prototype.renderSubView = function (view) {
                view.setElement(this.$(".discussion-response"));
                view.render();
                return view.delegateEvents();
            };
            ThreadResponseView.prototype.renderEditView = function () {
                return this.renderSubView(this.editView);
            };
            ThreadResponseView.prototype.cancelCommentEdits = function () {
                return _.each(this.commentViews, function (view) {
                    return view.cancelEdit();
                });
            };
            ThreadResponseView.prototype.hideCommentForm = function () {
                return this.$(".comment-form").closest("li").hide();
            };
            ThreadResponseView.prototype.showCommentForm = function () {
                return this.$(".comment-form").closest("li").show();
            };
            ThreadResponseView.prototype.createShowView = function () {
                var self = this;
                if (this.editView) {
                    this.editView.$el.empty();
                }
                if (this.showView) {
                    this.showView.model = this.model;
                } else {
                    this.showView = new ThreadResponseShowView({ model: this.model });
                    this.showView.bind("response:_delete", this._delete);
                    this.showView.bind("response:edit", this.edit);
                    return this.showView.on("comment:endorse", function () {
                        return self.trigger("comment:endorse");
                    });
                }
            };
            ThreadResponseView.prototype.renderShowView = function () {
                return this.renderSubView(this.showView);
            };
            ThreadResponseView.prototype.cancelEdit = function (event) {
                event.preventDefault();
                this.createShowView();
                this.renderShowView();
                DiscussionUtil.typesetMathJax(this.$el.find(".response-body"));
                return this.showCommentForm();
            };
            ThreadResponseView.prototype.edit = function () {
                this.createEditView();
                this.renderEditView();
                this.cancelCommentEdits();
                return this.hideCommentForm();
            };
            ThreadResponseView.prototype.update = function (event) {
                var newBody,
                    url,
                    self = this;
                newBody = this.editView.$(".edit-post-body textarea").val();
                url = DiscussionUtil.urlFor("update_comment", this.model.id);
                return DiscussionUtil.safeAjax({
                    $elem: $(event.target),
                    $loading: event ? $(event.target) : void 0,
                    url: url,
                    type: "POST",
                    dataType: "json",
                    data: { body: newBody },
                    error: DiscussionUtil.formErrorHandler(this.$(".edit-post-form-errors")),
                    success: function () {
                        self.editView.$(".edit-post-body textarea").val("").attr("prev-text", "");
                        self.editView.$(".wmd-preview p").html("");
                        self.model.set({ body: newBody });
                        self.createShowView();
                        self.renderShowView();
                        DiscussionUtil.typesetMathJax(self.$el.find(".response-body"));
                        return self.showCommentForm();
                    },
                });
            };
            return ThreadResponseView;
        })(DiscussionContentView);
    }
}.call(window));
