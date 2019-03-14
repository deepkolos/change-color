const vscode = require('vscode');
const Range = vscode.Range;
const filterInRange = require('./utils').filterInRange;

const SEARCH_CHAR_LEN = 25;
const colorType = ['hex', 'hsl', 'rgb'];
const convertors = colorType.map(type => require(`./${type}.js`));

// 统一使用[r, g, b, a]作为颜色格式, 变量名为color
// r, g, b 是0 ~ 255并且支持小数点的数字

exports.register = context => {
  const addCommand = (type, withOpacity) => {
    let disposable = vscode.commands.registerCommand(
      `extension.colorTo${type.name.toUpperCase() + (withOpacity ? 'A' : '')}`,
      function() {
        const editor = vscode.window.activeTextEditor;

        if (!editor) return;

        const { document, selections } = editor;

        editor.edit(editBuilder => {
          // 找到选择里面的color
          selections.forEach(selection => {
            const selectionStartOffset = document.offsetAt(selection.start);
            const selectionEndOffset = document.offsetAt(selection.end);
            const startOffset = selectionStartOffset - SEARCH_CHAR_LEN;
            const endOffset = selectionEndOffset + SEARCH_CHAR_LEN;
            const searchRange = document.validateRange(
              new Range(
                document.positionAt(startOffset),
                document.positionAt(endOffset)
              )
            );
            const searchStr = document.getText(searchRange);
            const searchStartOffset = document.offsetAt(searchRange.start);
            const searchEndOffset = document.offsetAt(searchRange.end);
            const searchStartLen = selectionStartOffset - searchStartOffset - 1;
            const searchEndLen = searchEndOffset - selectionEndOffset - 1;
            // 减一是支持识别光标在颜色值边缘的情况: #000000光标位置

            convertors.forEach(convertor => {
              const marks = convertor.parse(
                searchStr,
                filterInRange.bind(
                  null,
                  searchStr,
                  searchStartLen,
                  searchEndLen
                ),
                searchStartLen,
                searchEndLen
              );

              // 如果对应的convertor识别出来颜色就转换为目标格式
              if (marks.length) {
                marks.forEach(mark => {
                  const startOffset = searchStartOffset + mark.start;

                  editBuilder.replace(
                    new Range(
                      document.positionAt(startOffset),
                      document.positionAt(startOffset + mark.length)
                    ),
                    type.stringify(mark.color, withOpacity)
                  );
                });
              }
              // if (marks && marks.length) {
              //   console.log(marks);

              //   marks.forEach(mark => {
              //     console.log(type.stringify(mark.color, withOpacity));
              //   });
              // }
            });

            // 检测该行是否有颜色
            // 这里可以使用正则提取所有的颜色
            // 然后命中范围里面的颜色
            // 但是搜索范围,一般都是使用正则去搜索
            // 但是如果这样确定之后后面支持多行的时候就不能这样去弄的了
            // 要么还是使用范围搜索
            // 每一个节点处理50个字符一般都足够的了,一个颜色的定义不会那么复杂
            // 那就固定范围搜索好的了,如果是这样的话,是可以完成的了,只需要截取这么一段范围,但是还是有点问题
            // OK还是使用范围搜索好的了
            // 足够的了,把那些打扁了,提取出来,但是还原回去怎么还原原本的格式呢?如果默认就是多行的
            // 但是我这里预设的输入结构是默认是这的统一的结构
            // 如果不使用统一的结构那么就需要编写每种格式的一对一转换机制,这样就可以使用一种格式的了
            // 不过这里的格式切换其实只有3中的格式,(hsl,rgb), (rgba,hsla), (hex,hexa)
            // 默认输出单行格式,如果过长格式化器会重新变成多行的
            // 如果是这样的话,就可以使用统一格式,单独输出即可,这个stringify相对比较容易
            // 那么大概是这个行为了
          });
        });
      }
    );

    context.subscriptions.push(disposable);
  };

  convertors.forEach(type => {
    addCommand(type);
    addCommand(type, true);
  });
};
