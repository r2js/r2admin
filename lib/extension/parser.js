module.exports = (type, instance) => (parser, nodes, lexer) => {
  const token = parser.nextToken();
  const args = parser.parseSignature(null, true);
  parser.advanceAfterBlockEnd(token.value);
  const body = parser.parseUntilBlocks('error', `end${type}`);
  let errorBody = null;

  if (parser.skipSymbol('error')) {
    parser.skip(lexer.TOKEN_BLOCK_END);
    errorBody = parser.parseUntilBlocks(`end${type}`);
  }

  parser.advanceAfterBlockEnd();
  return new nodes.CallExtensionAsync(instance, 'run', args, [body, errorBody]);
};
