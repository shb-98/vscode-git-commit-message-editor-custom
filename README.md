# 元ネタや readme

[本家様 github](https://github.com/phoihos/vscode-git-commit-message-editor)  
[本家様 marketplace](https://marketplace.visualstudio.com/items?itemName=phoihos.git-commit-message-editor)  
[本家様 readme](README_ORIGIN.md)  
素晴らしい本家様を見てね。

# fork 理由

すぐ忘れるので取り急ぎの部分だけでも日本語でカンペを用意したかった。

# 使い方

概ね本家様と同じ動きをするはず。たぶん。

custom と名乗っているので、再定義方法

```
"gitCommitMessageEditorCustom.intelliSense.constants.summaryType": [
    {
        "type": "feat",
        "title": "新機能",
        "description": "新しい機能の追加や既存機能の大幅な改善"
    }
],
"gitCommitMessageEditorCustom.intelliSense.constants.summaryEmoji": [
    {
        "code": ":sparkles:",
        "description": "新機能の追加"
    }
]
```

summerytype は

```
{
    "type": "",
    "title": "",
    "description": "",
    "emojis":[],
    "sort":1,

}
type以外はオプション
```

で
summaryEmoji は

```
{
    "code": "",
    "description": "",
    "emoji":""
}
code以外はオプション。
codeで新しいものを付け足す場合は、「:code:」のような形で定義してあげると周りに空気が読めると請け合い。
```

で再定義できます。

### 使わない emoji、type がある

type のみ削除できます。

```

"gitCommitMessageEditorCustom.intelliSense.constants.removeType":["feat"]

```

のような形で削除してください。

# 終わりに

基本的に出ることは値が追加される、上書きされることの確認までで、詳細に動きは見てないです。  
バグってたらすみません！
