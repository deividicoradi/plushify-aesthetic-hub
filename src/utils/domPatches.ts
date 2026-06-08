/**
 * DOM Patches
 * --------------------------------------------------------------
 * Corrige um bug conhecido onde extensões do navegador (Google
 * Translate, tradutores nativos do Chrome/Edge, etc.) modificam
 * a árvore DOM por baixo do React, fazendo o React quebrar com:
 *
 *   NotFoundError: Failed to execute 'removeChild' on 'Node':
 *   The node to be removed is not a child of this node.
 *
 * Também aparece com `insertBefore` pelo mesmo motivo.
 *
 * A solução defensiva é envolver os métodos nativos para que,
 * quando a árvore estiver fora de sincronia, eles façam um
 * fallback silencioso em vez de explodir e derrubar a app.
 *
 * Referência: https://github.com/facebook/react/issues/11538
 */

let installed = false;

export function installDomPatches(): void {
  if (installed) return;
  if (typeof Node === 'undefined') return;
  installed = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (typeof console !== 'undefined') {
        console.warn(
          '[domPatches] Ignorando removeChild de nó cujo pai mudou (provavelmente extensão do navegador).'
        );
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  } as typeof Node.prototype.removeChild;

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== 'undefined') {
        console.warn(
          '[domPatches] insertBefore com refNode fora do pai — usando appendChild como fallback.'
        );
      }
      return this.appendChild(newNode) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  } as typeof Node.prototype.insertBefore;
}

export function isDomMutationError(message: string): boolean {
  if (!message) return false;
  return (
    /Failed to execute 'removeChild' on 'Node'/i.test(message) ||
    /Failed to execute 'insertBefore' on 'Node'/i.test(message) ||
    /The node to be removed is not a child of this node/i.test(message) ||
    /NotFoundError.*removeChild/i.test(message)
  );
}