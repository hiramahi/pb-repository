window.addEventListener('DomContendLoaded', () => {
    // ログインモーダル⇒新規登録モーダル
    const signupModal = document.getElementById('signupArea');
    const loginErrorP = document.getElementById('loginAreaError');
    console.log(signupModal);
    console.log(document.getElementById('changeSignupAreaBtn'));
    document.getElementById('changeSignupAreaBtn').addEventListener('click', () => {
    // error初期化
    if(loginErrorP.innerText != ''){
        loginErrorP.innerText = '';
    }

    loginModal.style.display = 'none';
    signupModal.style.display = 'block';
    });

    //   新規登録モーダル⇒ログインモーダル(戻るボタン)
    const signupErrorP = document.getElementById('signupAreaError');
    document.signupForm.onreset = function() {
    if(confirm('入力内容が初期化されます。\nログインモーダルに戻りますか？')){
        // error初期化
        if(signupErrorP.innerText != ''){
        signupErrorP.innerText = '';
        }
        
        signupModal.style.display = 'none';
        loginModal.style.display = 'block';
        return;
    }
    return false;
    }

    // 新規登録モーダル⇒入力内容確認モーダル(パスワードチェック)
    const signupConfirmModal = document.getElementById('signupConfirmArea');
    const signupForm = document.signupForm;
    const signupConfirmForm = document.signupConfirmForm;
    signupForm.onsubmit = function() {
    if(signupForm.password.value === signupForm.confirm_password.value){
        // 入力内容を入力内容確認モーダルにコピー
        signupConfirmForm.id.value = signupForm.id.value;
        signupConfirmForm.password.value = signupForm.password.value;
        signupConfirmForm.confirm_password.value = signupForm.confirm_password.value;
        signupConfirmForm.name.value = signupForm.name.value;
        signupConfirmForm.kananame.value = signupForm.kananame.value;
        signupConfirmForm.nickname.value = signupForm.nickname.value;

        // error初期化
        if(signupErrorP.innerText != ''){
        signupErrorP.innerText = '';
        }

        signupModal.style.display = 'none';
        signupConfirmModal.style.display = 'block';
    }else{
        signupErrorP.innerText = 'パスワードと確認用パスワードが一致していません。';
    }
    return false;
    }

    // 入力内容確認モーダル⇒新規登録モーダル(戻るボタン)
    document.getElementById('backToSignupModalBtn').addEventListener('click', () => {
    signupConfirmModal.style.display = 'none';
    signupModal.style.display = 'block';
    });

    // お問い合わせモーダル⇒入力内容確認モーダル(ユーザチェック)
    const contactConfirmModal = document.getElementById('contactConfirmArea');
    const contactForm = document.contactForm;
    const contactConfirmForm = document.contactConfirmForm;
    // contactForm.addEventListener('submit', (e) => {
    //   // select
    //   const contactCategorySelect = contactForm.category_select;
    //   const contactAgeSelect = contactForm.age_select;
    //   const contactConfirmCategorySelect = contactConfirmForm.category_select;
    //   const contactConfirmAgeSelect = contactConfirmForm.age_select;

    //   // radio
    //   const contactReplyRadios = contactForm.reply;
    //   const contactGenderRadios = contactForm.gender;
    //   const contactConfirmReplyRadios = contactConfirmForm.reply;
    //   const contactConfirmGenderRadios = contactConfirmForm.gender;

    //   // textarea
    //   const contactTextarea = contactForm.textarea;
    //   const contactConfirmTextarea = contactConfirmForm.textarea;

    //   // 入力内容を入力内容確認モーダルにコピー
    //   // select
    //   for(let i = 1; i < contactCategorySelect.length; i++){
    //     const option = contactConfirmCategorySelect.options[i];
    //     if(contactCategorySelect.options[i].selected) option.selected = true;
    //     else option.disabled = true;
    //   }

    //   for(let i = 1; i < contactAgeSelect.length; i++){
    //     const option = contactConfirmAgeSelect.options[i];
    //     if(contactAgeSelect.options[i].selected) option.selected = true;
    //     else option.disabled = true;
    //   }

    //   // radio
    //   for(let i = 0; i < contactReplyRadios.length; i++){
    //     if(contactReplyRadios[i].checked){
    //       contactConfirmReplyRadios[i].checked = true;
    //       contactConfirmReplyRadios[i].disabled = false; // 1つの項目がdisabled = trueになると全ての項目に反映されるからfalseにする
    //     }else{
    //       contactConfirmReplyRadios[i].disabled = true;
    //     }
    //   }

    //   for(let i = 0; i < contactGenderRadios.length; i++){
    //     if(contactGenderRadios[i].checked){
    //       contactConfirmGenderRadios[i].checked = true;
    //       contactConfirmGenderRadios[i].disabled = false;
    //     }else{
    //       contactConfirmGenderRadios[i].disabled = true;
    //     }
    //   }

    //   // textarea
    //   contactConfirmTextarea.value = contactTextarea.value;

    //   contactModal.style.display = 'none';
    //   contactConfirmModal.style.display = 'block';

    //   e.stopPropagation(); // イベント伝播の停止
    //   e.preventDefault(); // イベントキャンセル
    // });

    // 入力内容確認モーダル⇒お問い合わせモーダル(戻るボタン)
    document.getElementById('backToContactModalBtn').addEventListener('click', () => {
    contactConfirmModal.style.display = 'none';
    contactModal.style.display = 'block';
    });

    // 退会ダイアログ表示
    // document.getElementById('userInfoDeleteBtn').addEventListener('click', () => {
    //   if(confirm('退会してもよろしいですか？')){
    //     if(confirm('本当に退会してもよろしいですか？')){
    //       // パスワードを求める処理
        
    //       window.location.href = 'http://localhost/hew_211214_toppage/delete.php';
    //     }
    //   }
    // });

})
