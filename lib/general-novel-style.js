"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _textlintRuleHelper = require("textlint-rule-helper");

var _kansuji = require("kansuji");

var _kansuji2 = _interopRequireDefault(_kansuji);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultOptions = {
    // 各段落の先頭に許可する文字
    "chars_leading_paragraph": "　「『【〈《（(“\"‘'［[〔｛{＜<",
    // 閉じ括弧の手前に句読点(。、)を置かない
    "no_punctuation_at_closing_quote": true,
    // 疑問符(？)と感嘆符(！)の直後にスペースを置く
    "space_after_marks": true,
    // 連続した三点リーダー(…)の数は偶数にする
    "even_number_ellipsises": true,
    // 連続したダッシュ(―)の数は偶数にする
    "even_number_dashes": true,
    // 連続した句読点(。、)を許可しない
    "appropriate_use_of_punctuation": true,
    // 連続した中黒(・)を許可しない
    "appropriate_use_of_interpunct": true,
    // 連続した長音符(ー)を許可しない
    "appropriate_use_of_choonpu": true,
    // マイナス記号(−)は数字の前にしか許可しない
    "appropriate_use_of_minus_sign": true,
    // アラビア数字の桁数は2桁まで (false: チェックしない)
    "max_arabic_numeral_digits": 2
};

function repeat(str, n) {
    if (String.prototype.repeat) return String.prototype.repeat.call(str, n);
    var arr = [];
    for (var i = 0; i < n; i++) {
        arr.push(str);
    }return arr.join("");
}

function reporter(context) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var opts = Object.assign({}, defaultOptions, options);
    var charsLeadingParagraph = opts["chars_leading_paragraph"] || "";
    var noPunctuationAtClosingQuote = opts["no_punctuation_at_closing_quote"];
    var spaceAfterMarks = opts["space_after_marks"];
    var evenNumberEllipsises = opts["even_number_ellipsises"];
    var evenNumberDashes = opts["even_number_dashes"];
    var appropriateUseOfPunctuation = opts["appropriate_use_of_punctuation"];
    var appropriateUseOfInterpunct = opts["appropriate_use_of_interpunct"];
    var appropriateUseOfChoonpu = opts["appropriate_use_of_choonpu"];
    var appropriateUseOfMinusSign = opts["appropriate_use_of_minus_sign"];
    var maxArabicNumeralDigits = opts["max_arabic_numeral_digits"];

    var helper = new _textlintRuleHelper.RuleHelper(context);
    var Syntax = context.Syntax,
        RuleError = context.RuleError,
        _fixer = context.fixer,
        report = context.report,
        getSource = context.getSource;

    return _defineProperty({}, Syntax.Paragraph, function (node) {
        if (helper.isChildNode(node, [Syntax.BlockQuote])) {
            return;
        }

        return new Promise(function (resolve, reject) {
            var text = getSource(node);

            var reportMatches = function reportMatches(_ref) {
                var pattern = _ref.pattern,
                    test = _ref.test,
                    message = _ref.message,
                    indexer = _ref.indexer,
                    fixer = _ref.fixer;

                var matches = void 0;
                pattern.lastIndex = 0;
                while (matches = pattern.exec(text)) {
                    if (!test || test.apply(null, matches)) {
                        var range = [matches.index, matches.index + matches[0].length];
                        var args = [range].concat(matches);
                        var index = indexer ? indexer.apply(null, args) : matches.index;
                        var fix = fixer ? fixer.apply(null, args) : null;
                        report(node, new RuleError(message, { index: index, fix: fix }));
                    }
                }
            };

            if (charsLeadingParagraph) {
                if (charsLeadingParagraph.indexOf(text.charAt(0)) == -1) {
                    report(node, new RuleError("\u6BB5\u843D\u306E\u5148\u982D\u306B\u8A31\u53EF\u3055\u308C\u3066\u3044\u306A\u3044\u6587\u5B57\u304C\u5B58\u5728\u3057\u3066\u3044\u307E\u3059", {
                        fix: _fixer.insertTextBeforeRange([0, 0], charsLeadingParagraph[0])
                    }));
                }
            }

            if (spaceAfterMarks) {
                reportMatches({
                    pattern: /[？！](?![　？！」』】〉》）\)”"’'］\]〕｝\}＞>]|$)/g,
                    message: "感嘆符(！)・疑問符(？)の直後にスペースか閉じ括弧が必要です",
                    fixer: function fixer(range) {
                        return _fixer.insertTextAfterRange(range, "　");
                    }
                });
            }

            if (evenNumberEllipsises) {
                reportMatches({
                    pattern: /…+/g,
                    test: function test(s) {
                        return s.length % 2 == 1;
                    },
                    message: "連続した三点リーダー(…)の数が偶数ではありません",
                    fixer: function fixer(range) {
                        return _fixer.insertTextAfterRange(range, "…");
                    }
                });
            }

            if (evenNumberDashes) {
                reportMatches({
                    pattern: /―+/g,
                    test: function test(s) {
                        return s.length % 2 == 1;
                    },
                    message: "連続したダッシュ(―)の数が偶数ではありません",
                    fixer: function fixer(range) {
                        return _fixer.insertTextAfterRange(range, "―");
                    }
                });
            }

            if (appropriateUseOfPunctuation) {
                reportMatches({
                    pattern: /。。+|、、+/g,
                    message: "連続した句読点(。、)が使われています",
                    fixer: function fixer(range, s) {
                        return _fixer.replaceTextRange(range, repeat("……", Math.ceil(s.length / 3)));
                    }
                });
            }

            if (appropriateUseOfInterpunct) {
                reportMatches({
                    pattern: /・・+/g,
                    message: "連続した中黒(・)が使われています",
                    fixer: function fixer(range, s) {
                        return _fixer.replaceTextRange(range, repeat("……", Math.ceil(s.length / 3)));
                    }
                });
            }

            if (appropriateUseOfChoonpu) {
                reportMatches({
                    pattern: /ーー+/g,
                    message: "連続した長音符(ー)が使われています",
                    fixer: function fixer(range, s) {
                        return _fixer.replaceTextRange(range, repeat("――", Math.ceil(s.length / 2)));
                    }
                });
            }

            if (noPunctuationAtClosingQuote && !/\[.*[。、]+\]\(.*\)/g.test(text)) {
                reportMatches({
                    pattern: /[。、]+(?=[」』】〉》）\)”"’'］\]〕｝\}＞>])/g,
                    message: "句読点(。、)が閉じ括弧の直前に存在しています",
                    indexer: function indexer(range) {
                        return range[1] - 1;
                    },
                    fixer: function fixer(range) {
                        return _fixer.removeRange(range);
                    }
                });
            }

            if (appropriateUseOfMinusSign) {
                reportMatches({
                    pattern: /−(?![0-9０１２３４５６７８９〇一二三四五六七八九十])/g,
                    message: "マイナス記号(−)の直後が数字ではありません",
                    fixer: function fixer(range, s) {
                        return _fixer.replaceTextRange(range, "ー");
                    }
                });
            }

            if (typeof maxArabicNumeralDigits == "number" && !/#[0-9]/.test(text)) {
                reportMatches({
                    pattern: /([0-9０１２３４５６７８９]+)(?:[\.．]([0-9０１２３４５６７８９]+))?/g,
                    test: function test(s, a, b) {
                        return a.length > maxArabicNumeralDigits || b && b.length > maxArabicNumeralDigits;
                    },
                    message: maxArabicNumeralDigits + "\u6841\u3092\u8D85\u3048\u308B\u30A2\u30E9\u30D3\u30A2\u6570\u5B57\u304C\u4F7F\u308F\u308C\u3066\u3044\u307E\u3059",
                    fixer: function fixer(range, s) {
                        return _fixer.replaceTextRange(range, (0, _kansuji2.default)(s, { wide: true }));
                    }
                });
            }

            resolve();
        });
    });
}

exports.default = {
    linter: reporter,
    fixer: reporter
};
//# sourceMappingURL=general-novel-style.js.map