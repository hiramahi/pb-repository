// // const ul = document.createElement('ul');

// // for(let i = 0; i < 3; i++){
// //   const li = document.createElement('li');
// //   li.appendChild(document.createElement('a'));
// //   ul.appendChild(li);
// // }
// // console.log(ul);

// const dataSet = [
//   {
//     title: "top",
//     uri: "/top",
//     description: "このwebサイトのTOPページ",
//     tags: ["website"],
//   },
//   {
//     title: "about",
//     uri: "/about",
//     description: "このwebサイトの説明",
//     tags: ["about"],
//   },
//   {
//     title: "blog",
//     uri: "/blog",
//     description: "ブログ一覧",
//     tags: ["article"],
//   }
// ];

// const createElement = ({ tagName, children }) => {
//   const element = document.createElement(tagName);
//   if (children) {
//     element.appendChild(children);
//   }
//   return element;
// }

// const createMenuItem = (props) => {
//   const anchor = createElement({ tagName: "a" });  
//   anchor.text = props.anchor.text;
//   anchor.href = props.anchor.href;
//   return createElement({ tagName: "li", children: anchor });
// }

// const createMenu = (props) => {
//   const ul = createElement({ tagName: "ul" });
//   props.items.forEach(item => {
//     const menuItem = createMenuItem(item);
//     ul.appendChild(menuItem);
//   });
//   return ul;
// }

// const generateMenuProps = (dataSet, baseUrl) => {
//   const items = dataSet.map(param => {
//     return {
//       anchor: {
//         text: param.title,
//         href: baseUrl + param.uri,
//       },
//     };
//   });
//   return { items };
// }

// const menuProps = generateMenuProps(dataSet, "https://example.com");

// // createMenu(menuProps);
// console.log(menuProps);








// // 
//   // 投稿フォームデータ
//   const forumFormData = {
//     formTitle: {
//       tagName: 'p',
//       text: 'いいコメント書いてくれよな。',
//       className: 'product-modal__forum-form-title'
//     },
//     input: { tag: 'input' },
//     content: {
//       tagName: 'textarea',
//       className: 'product-modal__forum-textarea'
//     },
//     contentDiv: {
//       tagName: 'div',
//       className: 'product-modal__forum-textarea-div'
//     },
//     postBtn: {
//       tagName: 'button',
//       text: '投稿する',
//       className: 'product-modal__forum-postbtn'
//     },
//     form: { tagName: 'form' },
//     formDiv: {
//       tagName: 'div',
//       className: 'product-modal__forum-form-div'
//     }
//   }

let msg = ''

// #1
console.log('#1')
msg = msg + 'Hello '

// #2
setTimeout(() => { // 時間のかかる処理
  console.log('#2')
  msg = msg + "I'm "
  console.log(msg);
}, 500)

// #3
console.log('#3')
msg = msg + 'Jeccy'

// #4
console.log('#4')
console.log(msg)
