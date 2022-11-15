// 外部リソースが読み込まれる前に実行
window.addEventListener('DOMContentLoaded', init);

function init() {
	const displayArea = document.getElementById('displayArea');
	displayArea.style.zIndex = 1; // 全画面に戻った時に元に戻す
	let width = displayArea.getBoundingClientRect().width;
	let height = displayArea.getBoundingClientRect().height;

	// レンダラーを作成
	const canvas = document.getElementById('renderingArea');
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas, // html上のどのcanvas要素と紐づけるか
		antialias: true,
		alpha: true
	});

	// デバイスごとに解像度を調整する
	renderer.setPixelRatio(window.devicePixelRatio);

	renderer.setSize(width, height);

	// テクスチャをガンマ補正
	// 光が当たっているところの白とびを抑える、暗すぎるところを明るくする、といった自動で色空間の調整を行ってくれる
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.gammaFactor = 2.2;

	// 影を有効にする
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// シーンを作成
	const scene = new THREE.Scene();

	// // フォグを設定(色, 開始距離, 終点距離)
	// scene.fog = new THREE.Fog(0xdddddd, 1000, 60000);

	// xyz軸(補助線)
	// scene.add(new THREE.AxisHelper(1500));

	///////////////////////////////////
	// テクスチャ読み込み
	const texEqu = new THREE.TextureLoader().load('img/background.jpg');
	texEqu.anisotropy = renderer.getMaxAnisotropy();
	texEqu.mapping = THREE.UVMapping;

	// 背景用ジオメトリ生成、THREE.SphereGeometry(radius, widthSegments, heightSegments)
	const sphereGeometry = new THREE.SphereGeometry(100000, 32, 32);
	sphereGeometry.scale(-1, 1, 1); // コレを指定しないと背景が左右反転してしまう
	const mat = new THREE.MeshBasicMaterial({
		map: texEqu,
		fog: false,
	});
	bgMesh = new THREE.Mesh(sphereGeometry, mat);
	scene.add(bgMesh);
	////////////////////////////



	// カメラを作成
	// const camera = new THREE.PerspectiveCamera(45, width / height, 1, 60000);
	const camera = new THREE.PerspectiveCamera(45, width / height, 1, 600000);
	// camera.position.set(0, 6000, 0);
	camera.position.set(0, 12530.046668032428, 0);
	// scene.add(camera); // ライトを追従させるために追加する

	// ライトを作成(環境光源 = 3D空間全体に均等に当てる光)
	// scene.add(new THREE.AmbientLight(0xffffff)); // これ使う
	scene.add(new THREE.AmbientLight(0x666666));

	// ライトを作成(平行光源 = 太陽光のように一定方向から差し込む光)
	const directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(9343.224761177347, 3813.073145443687, -3071.7958900095587);
	// camera.add(directionalLight); // カメラに追従させるために追加する

	directionalLight.castShadow = true; // ライトに影を有効にする
	directionalLight.shadow.camera.near = 100;
	directionalLight.shadow.camera.far = 25000;
	directionalLight.shadow.camera.right = 12000;
	directionalLight.shadow.camera.left = -10000;
	directionalLight.shadow.camera.top = -2000;
	directionalLight.shadow.camera.bottom = 6000;
	// directionalLight.shadow.mapSize.set(1024, 1024);
	scene.add(directionalLight);

	// 平行光源のヘルパー作成
	// scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

	// カメラコントローラを作成(camera系クラスのオブジェクト, マウス操作対象とするDOM要素)
	// 第2引数を省略した場合、ブラウザ全体がマウス操作の対象となる
	const controls = new THREE.OrbitControls(camera, renderer.domElement);

	// カメラに制限をかける　⇒　本番はコメントアウト外す
	// controls.enablePan = false;
	// controls.enableRotate = false;
	// controls.enableZoom = false;

	const loader = new THREE.GLTFLoader();

	// glb読込
	function loaderGLB(obj) {
		loader.load(
			`glb/${obj.url}.glb`,
			(gltf) => {
				const model = gltf.scene;
				model.name = obj.name;
				model.scale.set(obj.scaleX, obj.scaleY, obj.scaleZ);
				model.position.set(obj.posX, obj.posY, obj.posZ);

				let group = obj.group, idx = obj.idx;
				if (group === scene) idx = scene.children.length;
				group.children[idx] = model;
			}
		);
	}

	// 各マップをグループで管理(scene上)
	const mapWrap = new THREE.Group();
	mapWrap.name = 'mapWrap';
	scene.add(mapWrap);

	// 各マップをobjで管理
	const maps = {
		osaka: {
			url: 'generalMap_box5_kanagawa',
			name: 'kanagawa',
			posX: -20091.879998504104,
			posY: -70,
			posZ: -34800.156976986,
			deg: -120,
			state: false
		},
		loginContact: {
			url: 'generalMap_box5_header9',
			name: 'loginContact',
			posX: -20091.879998504104,
			posY: -70,
			posZ: 34800.156976986,
			deg: 120,
			state: false
		},
		tokyo: {
			url: 'generalMap_box5_tokyo2',
			name: 'tokyo',
			posX: 0,
			posY: -70,
			posZ: 0,
			deg: 0,
			state: true
		}
	};

	// 各マップのプロパティを配列で管理
	const mapsKeyArr = Object.keys(maps);

	// 共通プロパティ設定後、glb読込(各マップ)
	for (let i = 0; i < mapsKeyArr.length; i++){
		loaderGLB(
			Object.assign(
				maps[mapsKeyArr[i]],
				{ scaleX: 100, scaleY: 100, scaleZ: 100, group: mapWrap, idx: i }
			)
		);
	}

	console.log(maps);

	// glb読込(ドローン)
	loaderGLB({ url: 'drone7', name: 'drone', scaleX: 50, scaleY: 50, scaleZ: 50, posX: 0, posY: 1150, posZ: 0, group: scene });

	// 動径を求める
	const x = 20058.845832644274;
	const y = 11932.697614373747;
	const z = -10742.72635971047;
	const xSquared = Math.pow(x, 2);
	const ySquared = Math.pow(y, 2);
	const zSquared = Math.pow(z, 2);
	const radius = Math.sqrt(xSquared + ySquared + zSquared);

	// 初期のマウス位置を設定
	let mouseX = window.innerWidth / 2;
	let mouseY = window.innerHeight / 2;

	// 初期の天頂角と偏角を取得
	let theta = Math.acos(y / radius);
	let phi = Math.sign(z) * Math.acos(x / Math.sqrt(xSquared + zSquared));

	// マウス動かしたときスクリーン座標取得
	document.querySelector('html body').addEventListener('mousemove', (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
	});

	// 毎フレーム実行させる
	let requestID = 0;
	function mapTick() {
		// カメラコントローラーを更新
		controls.update();

		// マウスが動いたときにカメラ位置アニメーション
		let targetTheta = (mouseY / height) * 20 + 50; // 天頂角(θ)を求める(範囲は30~60)
		let targetPhi = (mouseX / width) * -20 - 20; // 偏角(φ)を求める(範囲は-30~-60)

		// イージングの公式を使って滑らかにする
		theta += (targetTheta - theta) * 0.02;
		phi += (targetPhi - phi) * 0.02;

		// ラジアンに変換
		const radTheta = theta * (Math.PI / 180);
		const radPhi = phi * (Math.PI / 180);

		// 各座標を求めた後に反映
		const endX = radius * Math.sin(radTheta) * Math.cos(radPhi);
		const endY = radius * Math.cos(radTheta);
		const endZ = radius * Math.sin(radTheta) * Math.sin(radPhi);
		camera.position.copy(new THREE.Vector3(endX, endY, endZ));

		camera.lookAt(new THREE.Vector3(0, 0, 0));

		//レンダリング
		renderer.render(scene, camera);

		// 更新が完了したら再度呼び出す
		requestID = requestAnimationFrame(mapTick);
	}

	// リサイズ処理
	window.addEventListener('resize', resize);
	resize();
	function resize() {
		// 新しくサイズを取得
		width = displayArea.getBoundingClientRect().width;
		height = displayArea.getBoundingClientRect().height;

		// レンダラーのサイズを調整する
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);

		camera.lookAt(new THREE.Vector3(0, 0, 0));

		// カメラのアスペクト比を正す
		camera.aspect = width / height;

		// カメラの内部状態を更新する
		camera.updateProjectionMatrix();
	}

	// 店舗ページ用の処理(一度だけ実行する処理 = goStoreが呼ばれる度に実行したくない処理) //////////////////////

	// 各商品のワールド座標
	const productWorldCoords = {
		x: [
			745, 660, 570, 475, 390, 745, 660, 570, 475, 390, 745, 660, 570, 475, 390, 745, 660, 570, 475, 390, 745, 660, 570, 475, 390, // nigiri
			180, 90, 0, -90, -180, 180, 90, 0, -90, -180, 180, 90, 0, -90, -180, 180, 90, 0, -90, -180, 180, 90, 0, -90, -180, // sand, side
			-390, -475, -570, -660, -745, -390, -475, -570, -660, -745, -390, -475, -570, -660, -745, -390, -475, -570, -660, -745, -390, -475, -570, -660, -745, // bento
			-925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, // sake
			-1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, // drink
			-1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, // drink
			-720, -635, -540, -440, -720, -635, -540, -440, -720, -635, -540, -440, -720, -630, -530, -440, // sweet
			-170, -65, 65, 170, -170, -65, 65, 170, -170, -65, 65, 170, -170, -65, 65, 170, // ice
			455, 555, 670, 760, 455, 560, 675, 765, 455, 555, 670, 765, 475, 580, 695, 790, // frozen
			845, 910, 965, 1010, 1060, 845, 910, 965, 1010, 1060, 850, 915, 970, 1020, 1070, 855, 920, 975, 1030, 1085, 885, 948, 1000, 1060, 1110, // ins
			1080, 1080, 1080, 1080, 1080, 1095, 1095, 1095, 1095, 1095, 1110, 1100, 1100, 1100, 1100, 1115, 1115, 1115, 1115, 1115, 1150, 1150, 1150, 1150, 1150, // pan
			1060, 1010, 965, 910, 845, 1060, 1010, 965, 910, 850, 1070, 1020, 970, 915, 850, 1085, 1030, 975, 920, 855, 1110, 1060, 1000, 948, 885, // snack
		],
		y: [
			545, 545, 545, 545, 545, 440, 440, 440, 440, 440, 335, 335, 335, 335, 335, 243, 240, 243, 242, 243, 135, 141, 137, 137, 135,
			545, 545, 545, 545, 545, 440, 440, 440, 440, 440, 335, 335, 335, 335, 335, 243, 240, 243, 242, 243, 135, 141, 137, 137, 135,
			545, 545, 545, 545, 545, 440, 440, 440, 440, 440, 335, 335, 335, 335, 335, 243, 240, 243, 242, 243, 135, 141, 137, 137, 135,
			623, 623, 623, 623, 530, 530, 530, 530, 437, 437, 437, 437, 337, 338, 340, 338, 237, 235, 237, 240, 135, 135, 140, 140,
			623, 623, 623, 623, 530, 530, 530, 530, 437, 437, 437, 437, 337, 338, 340, 338, 237, 235, 237, 240, 135, 135, 140, 140,
			623, 623, 623, 623, 530, 530, 530, 530, 437, 437, 437, 437, 337, 338, 340, 338, 237, 235, 237, 240, 135, 135, 140, 140,
			570, 570, 570, 570, 470, 470, 460, 470, 360, 360, 360, 360, 250, 250, 250, 250,
			550, 550, 555, 555, 460, 462, 460, 462, 275, 260, 260, 260, 195, 195, 165, 195,
			555, 555, 555, 555, 460, 462, 460, 462, 285, 285, 285, 285, 185, 185, 180, 185,
			597, 597, 597, 597, 597, 460, 460, 460, 460, 460, 335, 335, 335, 335, 335, 215, 215, 215, 215, 215, 94, 93, 91, 88, 94,
			593, 597, 593, 593, 593, 460, 460, 460, 460, 460, 335, 335, 335, 335, 335, 215, 215, 215, 215, 215, 94, 93, 91, 88, 94,
			593, 597, 593, 593, 593, 460, 460, 460, 460, 460, 335, 335, 335, 335, 335, 215, 215, 215, 215, 215, 94, 93, 91, 88, 94,
		],
		z: [
			-865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075,
			-1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125,
			-1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865,
			-715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450,
			-150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150,
			450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715,
			900, 955, 1005, 1065, 900, 955, 1005, 1065, 900, 955, 1005, 1065, 900, 960, 1015, 1065,
			1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1230, 1230, 1230, 1230,
			1140, 1070, 1000, 940, 1140, 1080, 1005, 945, 1140, 1070, 1000, 945, 1160, 1095, 1025, 970,
			730, 635, 535, 430, 335, 730, 635, 535, 430, 335, 735, 640, 540, 435, 340, 740, 645, 550, 450, 355, 770, 677, 570, 480, 385,
			206, 103, 0, -103, -206, 206, 103, 0, -103, -206, 206, 103, 0, -103, -206, 206, 103, 0, -103, -206, 206, 103, 0, -103, -206,
			-335, -430, -535, -635, -730, -335, -430, -535, -635, -735, -340, -435, -540, -640, -735, -355, -450, -550, -645, -740, -385, -480, -570, -677, -770,
		]
	};

	// 取得したjsonデータ整形(各商品を商品番号で管理)
	const products = {};
	for (let i = 0; i < jsonProducts.length; i++) {
		// jsonProducts[i].posX = productWorldCoords.x[i];
		// jsonProducts[i].posY = productWorldCoords.y[i];
		// jsonProducts[i].posZ = productWorldCoords.z[i];

		const obj = {
			scaleX: 25,
			scaleY: 25,
			scaleZ: 25,
			posX: (productWorldCoords.x[i] / 4),
			posY: (((productWorldCoords.y[i] - 200) / 4) - 9),
			posZ: (productWorldCoords.z[i] / 4),
			group: wrap,
			idx: i
		};

		products[`${jsonProducts[i].id}`] = jsonProducts[i];
		delete products[`${jsonProducts[i].id}`].id;
	}
	console.log(jsonProducts);
	console.log(products);

	const productsKeyArr = Object.keys(products);

	// 各商品をグループで管理(scene上)
	const wrap = new THREE.Group();
	wrap.name = 'wrap';
	scene.add(wrap);

	// glb読込(商品)
	for (let i = 0; i < productsKeyArr.length - 255; i++) {
		const key = productsKeyArr[i];
		const url = 'glb/' + products[key].imgURL + '.glb';
		loader.load(
			url,
			(gltf) => {
				const model = gltf.scene;
				model.name = {
					id: key,
					name: products[key].name,
					price: products[key].price
				};
				model.scale.set(25.0, 25.0, 25.0);
				model.position.set((products[key].x / 4), (((products[key].y - 200) / 4) - 9), (products[key].z / 4));
				wrap.children[i] = model;
			},
			undefined,
			undefined
		);
	}

	// ローディング関連処理
	// let loadingImgNum = 2;
	// const loadingImg = document.getElementById('loadingImg');
	// let loadImgIntervalID = setInterval(() => {
	//   loadingImg.src = `img/hew2_loading${loadingImgNum++}.png`;
	//   if(loadingImgNum === 5) loadingImgNum = 1;
	// }, 300);

	// let dragControls = null;
	// let loadGlbIntervalID = setInterval(() => { progressLoading(); }, 10);
	// const loadingArea = document.getElementById('loadingArea');
	// const progressBarPercent = document.getElementById('progressBarPercent');

	// function progressLoading() {
	//   // パーセント算出
	//   const percent = (wrap.children.length / (productsKeyArr.length)) * 99;
	//   progressBarPercent.textContent = Math.round(percent);

	//   // 全ての3Dオブジェを配置後に実行
	//   if(percent === 99 && wrap.children.length === (productsKeyArr.length)){
	//     clearInterval(loadGlbIntervalID);

	//     setTimeout(() => {
	//       clearInterval(loadImgIntervalID);

	//       loadingArea.classList.remove('loading-area--active');
	setTimeout(() => {
		mapTick();
		dragControls = new THREE.DragControls(scene.getObjectByName('wrap').children, camera, renderer.domElement);
	}, 1000);
	//     }, 800);
	//   }
	// }

	// let loadingDescNum = 1;
	// const loadingAreaDescTitle = document.getElementById('loadingAreaDescTitle');
	// const loadingAreaDescCont = document.getElementById('loadingAreaDescCont');
	// const loadingAreaDescPageNum = document.getElementById('loadingAreaDescPageNum');
	// const loadingAreaDescs = {
	//   title: ['マップ上での操作方法', '店舗内での操作方法'],
	//   cont: [
	//     '1. 右上の一覧から店舗を選択して、メニューの「マップ移動」（デフォルトでは東京マップに移動済）をクリックします。<br>2. 移動後、「出発する」が有効になるのでクリックします。<br>3. 出発後、「店に入る」が有効になるのでクリックします。<br>4. 入店後、買い物が始められます。',
	//     '1. 上の一覧、又はマウスをスライドして商品棚を移動します。<br>2. マウスを商品に合わせることで簡易情報を表示します。<br>3. 商品をダブルクリックで詳細情報を表示します。<br>4. 商品を「ドローンアイコン」までドラッグ&ドロップすることでドローンに積むことができます。<br>5. 上の一覧から「ドローンを飛ばす」をクリックで購入、指定住所にお届けします。'
	//   ]
	// };

	// // ローディングエリアの説明文を別のものに変更
	// loadingArea.addEventListener('contextmenu', (e) => {
	//   loadingAreaDescTitle.textContent = loadingAreaDescs.title[loadingDescNum];
	//   loadingAreaDescCont.innerHTML = loadingAreaDescs.cont[loadingDescNum];

	//   loadingAreaDescPageNum.textContent = (loadingDescNum + 1);

	//   loadingDescNum = (loadingDescNum === 1) ? 0 : 1;

	//   e.preventDefault();
	// });

	if(jsonUserName.name !== 'ゲスト'){
		document.getElementById('userNameArea').textContent = jsonUserName.name;
	}

	const selectedQuantityModal = document.getElementById('selectedQuantityModal');
	const storeOverlay = document.getElementById('storeOverlay');
	const selectedQuantityTitle = document.getElementById('selectedQuantityTitle');

	// ドラッグ開始時(商品オブジェ)
	function dragstartObj(e) {
		controls.enabled = false;
		if (productModal.className === 'product-modal product-modal--active') slideModal(-310);
	}

	// ドラッグ終了時(商品オブジェ)
	function dragendObj(e) {
		controls.enabled = true;

		const x = (mouse.x + 1) * width / 2;
		const y = (mouse.y - 1) * height * (-1) / 2;

		// 範囲内であればカート操作
		if (x > (width - 100) && 130 < y && y < 230) {
			selectedQuantityTitle.textContent = `${e.object.parent.name.name}（${e.object.parent.name.price}円）`;
			toggleStoreOverlay();
		}

		// 商品を棚に戻す
		// e.object.position.copy({x:0, y:0, z:0})
		e.object.position.copy(new THREE.Vector3(0, 0, 0));
	}

	for (const btn of [storeOverlay, document.getElementById('selectedQuantityHideBtn')]) {
		btn.addEventListener('click', toggleStoreOverlay);
	}

	function toggleStoreOverlay() {
		selectedQuantityModal.classList.toggle('selected-quantity-modal--active');
		storeOverlay.classList.toggle('store-overlay--active');
	}

	// 棚データ作成
	const rackData = [
		{ x: 396.12358334861733, z: -681.0196365498881, deg: 300 }, // おにぎり
		{ x: -0.8703302749177758, z: -787.8457216845842, deg: 270 }, // サンド・惣菜
		{ x: -392.89508749845885, z: -682.887317843192, deg: 240 }, // 弁当
		{ x: -679.9758159772613, z: -397.91271447083517, deg: 210 }, // 酒
		{ x: -787.8461807573309, z: 0.184709441474724, deg: 180 }, // 飲料
		{ x: -680.8265228339127, z: 396.45540033826535, deg: 150 }, // 飲料
		{ x: -390.79018124558115, z: 684.0940526663976, deg: 120 }, // デザート
		{ x: -2.5577700987350083, z: 787.8420504540314, deg: 90 }, // アイス
		{ x: 398.8229432709864, z: 679.442343817456, deg: 60 }, // 冷凍食品
		{ x: 686.7981247447103, z: 386.0181012577517, deg: 30 }, // インスタント
		{ x: 787.8453089236523, z: 1.186532125821194, deg: 0 }, // パン
		{ x: 682.5451434224692, z: -393.4892194735348, deg: 330 } // 菓子
	];

	let canPrepareMoveCam = true; // カメラ移動が終わるまで次の移動を実行させない
	let currentRackNum = 1; // 現在の棚の位置を常に保持
	const cambtnArea = document.getElementById('cambtnArea');

	// 各棚ボタンにイベント発行
	for (let i = 1; i <= rackData.length; i++) {
		cambtnArea.children[0].children[i].addEventListener('click', (e) => {
			if (!canPrepareMoveCam) return;
			canPrepareMoveCam = false; // カメラ移動をロック

			// 現在の棚と対称にある棚がクリックされた時、強制的に左右どちらかの回転移動をさせる(対称移動時のみ)
			const targetTime = calcCamMoveTime(currentRackNum, i);
			const targetDeg = (targetTime === 750) ? (rackData[i - 1].deg + 0.1) : rackData[i - 1].deg;
			moveCamera(targetDeg, targetTime, rackData[i - 1].x, rackData[i - 1].z);

			changeCamBtnStyle(currentRackNum, i);
			currentRackNum = i;
		});
	}

	// カメラの移動時間を計算
	function calcCamMoveTime(currentRackNum, targetRackNum) {
		const diffNum = Math.abs(targetRackNum - currentRackNum);
		const time =
			(diffNum === 0) ? 800 :
				(diffNum === 1 || diffNum === 11) ? 500 : (diffNum === 2 || diffNum === 10) ? 550 :
					(diffNum === 3 || diffNum === 9) ? 600 : (diffNum === 4 || diffNum === 8) ? 650 :
						(diffNum === 5 || diffNum === 7) ? 700 : 750;
		return time;
	}

	// カメラボタンのスタイル更新
	function changeCamBtnStyle(currentRackNum, targetRackNum) {
		cambtnArea.children[0].children[currentRackNum].style.background = '';
		cambtnArea.children[0].children[targetRackNum].style.background = '#2C92C5';
	}

	// カメラ移動(棚ボタン)
	function moveCamera(deg, time, x, z) {
		let progress = 0;
		const maxRadius = 800;
		const startX = camera.position.x;
		const startZ = camera.position.z;

		const radian = deg * Math.PI / 180;
		const endX = maxRadius * Math.cos(radian);
		const endZ = maxRadius * Math.sin(radian);

		const diffX = endX - startX;
		const diffZ = endZ - startZ;

		// requestAnimationFrame()に渡すコールバック関数は、引数でタイムスタンプ(ミリ秒)を受け取る
		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / time;

				progress = Math.min(progress, 1);

				if (progress > 0) {
					const resultX = startX + diffX * progress;
					const resultZ = startZ + diffZ * progress;
					camera.position.copy(new THREE.Vector3(resultX, camera.position.y, resultZ));
				}

				if (progress < 1) {
					requestAnimationFrame(update);
				} else {
					camera.position.copy(new THREE.Vector3(x, camera.position.y, z)); // 対称移動の対策で最後に補正をかける
					canPrepareMoveCam = true; // カメラ移動のロック解除
				}
			}
		});
	}

	// カメラ移動(棚ボタン)(左右)
	const arrowBtns = document.getElementsByClassName('cambtn-area__btn__arrow');
	for (const btn of arrowBtns) {
		btn.addEventListener('click', (e) => {
			if (!canPrepareMoveCam) return;
			canPrepareMoveCam = false;

			// 次に移動する棚を求める
			let targetRackNum = 0;
			if (e.currentTarget.id === 'camLeftBtn') {
				if (currentRackNum > 1) { targetRackNum = currentRackNum - 1; }
				else { targetRackNum = 12; }
			} else {
				if (currentRackNum < 12) { targetRackNum = currentRackNum + 1; }
				else { targetRackNum = 1; }
			}

			moveCamera(rackData[targetRackNum - 1].deg, 500, rackData[targetRackNum - 1].x, rackData[targetRackNum - 1].z);
			changeCamBtnStyle(currentRackNum, targetRackNum);
			currentRackNum = targetRackNum;
		});
	}

	// カメラ位置リセット(店舗内)、角度も初期化要
	document.getElementById('camReset').addEventListener('click', () => {
		changeCamBtnStyle(currentRackNum, 1);
		currentRackNum = 1;
		camera.position.copy(new THREE.Vector3(rackData[0].x, camera.position.y, rackData[0].z));
	});

	// カメラ移動(汎用)
	function generalCamAnimate(x, y, z) {
		let progress = 0;
		const startX = camera.position.x;
		const startY = camera.position.y;
		const startZ = camera.position.z;

		const diffX = x - startX;
		const diffY = y - startY;
		const diffZ = z - startZ;

		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / 1000;

				progress = Math.min(progress, 1);

				if (progress > 0) {
					const resultX = startX + diffX * progress;
					const resultY = startY + diffY * progress;
					const resultZ = startZ + diffZ * progress;
					camera.position.copy(new THREE.Vector3(resultX, resultY, resultZ));
				}

				if (progress < 1) requestAnimationFrame(update);
			}
		});
	}

	const cartArea = document.getElementById('cartArea');
	const cartAreaStyle = window.getComputedStyle(cartArea);

	// コントローラ設定
	function setControls(x, z) {
		const xSquared = Math.pow(x, 2);
		const zSquared = Math.pow(z, 2);
		const radius = Math.sqrt(xSquared + zSquared);

		// カメラの制限を解除
		controls.enableRotate = true;
		controls.rotateSpeed = 0.1; // マウス回転スピードを下げる(デフォルトは1)
		controls.enableZoom = true;
		controls.enableDamping = true;
		controls.dampingFactor = 0.2;

		controls.minPolarAngle = Math.PI / 2.25; // 天井に行かせない
		controls.maxPolarAngle = Math.PI / 2.25; // 地下に行かせない
		controls.maxDistance = 800; /////////////////////////////////////////////////////////////////////////////// ここ調整要
		// controls.maxDistance = radius + 50; // 遠ざかれる距離の最大値
		console.log(radius, controls.maxDistance);
		controls.minDistance = 550; // 近づける距離の最大値
	}

	// コントローラ解除
	function removeControls() {
		controls.enablePan = false;
		controls.enableRotate = false;
		controls.enableZoom = false;
		controls.enableDamping = false;

		controls.minPolarAngle = 0;
		controls.maxPolarAngle = 3.141592653589793;
		controls.maxDistance = Infinity;
		controls.minDistance = 0;
	}

	// ピッキング関連処理 /////////////////////////////////////////////////////////////

	// マウス座標管理用のベクトルを作成
	const mouse = new THREE.Vector2();
	const ray = new THREE.Raycaster();

	//3Dオブジェクトを格納する変数
	let obj = [];

	const productModal = document.getElementById('productModal');
	const productModalStyle = window.getComputedStyle(productModal);

	function dblclickObj(e) {
		controls.enabled = false;
		// canvas要素の座標情報取得
		const rect = e.target.getBoundingClientRect();

		// canvas領域の左上(0,0)からのマウス座標を取得
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;

		// マウス座標を3D座標に変換
		mouse.x = -1 + ((2 * mouse.x) / width);
		mouse.y = 1 - ((2 * mouse.y) / height);

		// マウスの位置からまっすぐに伸びる光線(レイ)ベクトルに更新
		ray.setFromCamera(mouse, camera);

		// その光線と交差したオブジェ取得
		obj = ray.intersectObjects(scene.getObjectByName('wrap').children, true);

		controls.enabled = true;

		// 交差判定
		if (obj.length === 0) return;

		// xhrでデータ取得
		fetch('get_product_data.php', {
			method: 'POST',
			body: JSON.stringify({
				stores_id: 1, //////////////////////////////////////////////////////////////// 後で訂正
				products_name: obj[0].object.parent.name.name
			}),
			headers: { "Content-Type": "application/json" }
		}).then(response => {
			return response.json();
		}).then(json => {
			window.postProductData = Object.assign({}, json);
		}).then(() => {
			// 既にモーダルが表示されていれば閉じる
			if (productModal.className === 'product-modal product-modal--active') {
				slideModal(-310);
				setTimeout(() => { makeModalPackage(); }, 600);
			} else { makeModalPackage(); }
		});
	}

	// 3Dオブジェクトマウスムーブ処理 ///////////////////////////////////////////////////////////////

	//マウス座標管理用のベクトルを作成
	const screenMouse = new THREE.Vector2();
	let productObj = [];

	function mousemoveObj(e) {
		const rect = e.target.getBoundingClientRect();

		screenMouse.x = e.clientX - rect.left;
		screenMouse.y = e.clientY - rect.top;

		mouse.x = -1 + ((2 * screenMouse.x) / width);
		mouse.y = 1 - ((2 * screenMouse.y) / height);

		ray.setFromCamera(mouse, camera);

		productObj = ray.intersectObjects(scene.getObjectByName('wrap').children, true);
	}

	// モーダル作成の一連の処理 //////////////////////////////////////////////////////////////////////
	const productModalContent = document.getElementById('productModalContent');
	function makeModalPackage() {
		productModal.classList.add('product-modal--active');

		makeProductModal();

		slideModal(0);
	}

	// 商品詳細モーダルの中身を動的に作成
	const productModalProductBtn = document.getElementById('productModalProductBtn');
	function makeProductModal() {
		// モーダルの中身を初期化
		while (productModalContent.firstElementChild) productModalContent.removeChild(productModalContent.firstElementChild);

		// ナビゲーションのスタイル変更
		// productModalForumBtn.style.color = 'black';
		productModalForumBtn.style.borderBottom = '1px solid #9AA0A6';
		// productModalProductBtn.style.color = 'blue';
		productModalProductBtn.style.borderBottom = '2px solid white';

		const img = createElement('img', [], 'product-modal__img');
		img.src = `img/${window.postProductData.imgURL}.png`;

		const imgDiv = createElement('div', [img], 'product-modal__img-div');

		const h2 = createElement('h2', [createTextNode(window.postProductData.name)], 'product-modal__title', 'productModalTitle');

		const priceSpan = createElement('span', [createTextNode(window.postProductData.price)]);

		const priceP = createElement('p', [priceSpan, createTextNode('円 | ')], 'product-modal__price-quantity-p');

		const quantitySpan = createElement('span', [createTextNode(window.postProductData.stock)]);

		const quantityP = createElement('p', [createTextNode('在庫数'), quantitySpan, createTextNode('個')], 'product-modal__price-quantity-p');

		const priceQuantityP = createElement('p', [priceP, quantityP], 'product-modal__price-quantity', 'productModalPriceQuantity');

		const descP = createElement('p', [createTextNode(window.postProductData.explanation)], 'product-modal__desc');

		const optionArr = [];
		for (let i = 1; i <= window.postProductData.stock; i++) {
			const option = createElement('option', [createTextNode(i)]);
			option.value = i;
			if (i === 1) option.selected = true;
			optionArr.push(option);
		}

		const selectedSelect = createElement('select', optionArr, 'product-modal__select', 'productModalSelect');

		const selectLabel = createElement('label', [createTextNode('数量：'), selectedSelect], 'product-modal__label');

		const cartBtnDiv = createElement('div', [createTextNode('ドローンに積む')], 'addto-cart-btn', 'addToCartBtn');
		cartBtnDiv.addEventListener('click', addLocalStorage);

		const btnAreaDiv = createElement('div', [selectLabel, cartBtnDiv], 'product-modal__btn-area');

		const insertArr = [imgDiv, h2, priceQuantityP, descP, btnAreaDiv];

		productModalContent.appendChild(createFragment(insertArr));
	}

	// 商品詳細モーダル非表示
	document.getElementById('productModalHideBtn').addEventListener('click', () => { slideModal(-310); });

	// 商品詳細モーダルスライドアニメーション
	let canPrepareSlideModal = true;
	function slideModal(end) {
		if (!canPrepareSlideModal) return;
		canPrepareSlideModal = false;
		let progress = 0;
		const startModalRight = parseInt(productModalStyle.right);
		const endModalRight = end;
		const diffModalRight = endModalRight - startModalRight;

		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / 500;

				progress = Math.min(progress, 1);

				if (progress > 0) productModal.style.right = (startModalRight + diffModalRight * progress) + 'px';

				if (progress < 1) {
					requestAnimationFrame(update);
				} else {
					canPrepareSlideModal = true;
					if (end === -310) productModal.classList.remove('product-modal--active');
				}
			}
		});
	}

	// モーダル切り替え
	const productModalForumBtn = document.getElementById('productModalForumBtn');
	productModalForumBtn.addEventListener('click', () => { makeForumModal(); });
	productModalProductBtn.addEventListener('click', () => { makeProductModal(); });

	// 掲示板モーダルの中身を動的に作成
	function makeForumModal(e) {
		// モーダルの中身を初期化
		while (productModalContent.firstElementChild) productModalContent.removeChild(productModalContent.firstElementChild);

		// ナビゲーションのスタイル変更
		productModalProductBtn.style.borderBottom = '1px solid #9AA0A6';
		productModalForumBtn.style.borderBottom = '2px solid white';

		const formimg = createElement('img', []);
		formimg.src = 'img/forum_modal_post_inactive.png';

		const formimgDiv = createElement('div', [formimg], 'product-modal__forum-formimg-div');
		formimgDiv.addEventListener('click', openForumForm)

		const forumTitle = createElement('h2', [createTextNode('みんなの感想')], 'product-modal__forum-maintitle');

		const insertArr = [formimgDiv, forumTitle];

		productModalContent.appendChild(createFragment(insertArr));

		// 商品名と一致する投稿のインデックスを取り出す
		// const indexOfJsonForumData = [];
		// for(let i = 0; i < jsonForumData.length; i++){
		//   if(jsonForumData[i].product_name == window.postProductData.name) indexOfJsonForumData.push(i);
		// }

		// xhrでデータ取得
		fetch('get_forum_data.php', {
			method: 'POST',
			body: JSON.stringify({ products_name: obj[0].object.parent.name.name }),
			headers: { "Content-Type": "application/json" }
		}).then(response => {
			return response.json();
		}).then(json => {
			makeForumContent(json);
		});
	}

	// 掲示板のメインコンテンツ表示
	function makeForumContent(json) {
		if (json.length === 0) {
			const p = createElement('p', [createTextNode('*「この商品の感想はありません。」')], 'product-modal__forum-empty');
			productModalContent.appendChild(p);
			return;
		}

		// 元の閲覧エリア削除
		while (productModalContent.children[3]) productModalContent.removeChild(productModalContent.children[3]);

		// 閲覧エリア作成
		const liArr = [];
		for (let i = 0; i < json.length; i++) {
			const forumData = json[i];

			const content = createElement('p', [createTextNode(`${forumData.nickname}「${forumData.content}」`)], 'product-modal__forum-li__content');

			const date = createElement('p', [createTextNode(forumData.created_at)], 'product-modal__forum-li__date');

			const li = createElement('li', [content, date], 'product-modal__forum-li');
			liArr.push(li);
		}
		const ul = createElement('ul', liArr, 'product-modal__forum-ul');

		productModalContent.appendChild(ul);
	}

	const forumFormDiv = (function () {
		const formTitle = createElement('p', [createTextNode('感想お待ちしております。')], 'product-modal__forum-form-title', 'productModalForumFormTitle');

		const input = createElement('input', []);
		input.type = 'hidden';

		const content = createElement('textarea', [], 'product-modal__forum-textarea');
		content.name = 'forumTextarea'
		content.placeholder = 'おいしかったです。';
		content.required = 'true';

		const postBtn = createElement('button', [createTextNode('投稿する')], 'product-modal__forum-postbtn');
		postBtn.type = 'button';
		postBtn.addEventListener('click', insertForumData);

		const form = createElement('form', [input, content, postBtn]);
		form.name = 'postForm'

		return createElement('div', [formTitle, form], 'product-modal__forum-form-div');
	})();

	// 投稿エリア作成
	function openForumForm(e) {
		e.currentTarget.children[0].src = 'img/forum_modal_post_active.png'; // 画像変更
		forumFormDiv.children[0].textContent = '感想お待ちしております。';
		productModalContent.insertAdjacentElement('afterbegin', forumFormDiv); // フォーム展開

		// イベント更新
		e.currentTarget.removeEventListener(e.type, openForumForm);
		e.currentTarget.addEventListener('click', closeForumForm);
	}

	// XHRで投稿登録 + 反映
	function insertForumData() {
		fetch('insert_forum_data.php', {
			method: 'POST',
			body: JSON.stringify({
				products_id: window.postProductData.id,
				content: document.postForm.forumTextarea.value
			}),
			headers: { "Content-Type": "application/json" }
		}).then(response => {
			return response.json();
		}).then(json => {
			makeForumContent(json);

			document.postForm.forumTextarea.value = '';
			document.getElementById('productModalForumFormTitle').textContent = '投稿ありがとうございます。';
		});
	}

	// 投稿エリア閉じる
	function closeForumForm(e) {
		e.currentTarget.children[0].src = 'img/forum_modal_post_inactive.png';

		productModalContent.removeChild(productModalContent.children[0]);

		e.currentTarget.removeEventListener(e.type, closeForumForm);
		e.currentTarget.addEventListener('click', openForumForm);
	}

	// 一時的なDOMツリー作成
	function createFragment(children) {
		const fragment = document.createDocumentFragment();
		if (children) children.forEach(child => fragment.appendChild(child)); /////////////
		return fragment;
	}

	// カート機能 //////////////////////////////////////////////////////////////////////////////
	const storage = localStorage;

	document.getElementById('selectedQuantityCartBtn').addEventListener('click', addLocalStorage);

	// カートに入れる、localStorageに値を格納
	let canPrepareAddtoCart = true;
	function addLocalStorage(e) {
		if (!canPrepareAddtoCart) return;

		const product = window.postProductData;
		console.log(product);

		// JSON文字列から復元済み、コレクション型で取得
		const results = getCartContents();

		// カートに入れた商品がカート内に既に存在しているかチェック
		const result = results.find(result => result.value.id === product.id); // 訂正必要→drag&dropした時にもxml飛ばす(関数化したほうが良い)←window.postProductDataが取得できてないから

		// 更新前に在庫数を超えてないかと在庫不足チェック
		if (window.postProductData.stock === 0
			|| (typeof result !== 'undefined' && result.value.selectedQuantity === product.stock)) {
			viewMsgAddtoCart(1, `${product.name}は売り切れたため、ドローンに積めません。`);
			return;
		}

		// key設定(カートの中身が0、重複無し、重複あり)
		let key = '';
		if (results.length === 0) { key = '0_productInCart'; }
		else if (typeof result === 'undefined') { key = `${results.length}_productInCart`; }
		else { key = result.key; }

		// value設定
		const value = {
			id: product.id,
			name: product.name,
			price: product.price,
			stock: product.stock,
			imgURL: product.imgURL
		};

		// カートに入れた個数を取得
		let targetID = '';
		if (e.currentTarget.id === 'addToCartBtn') { targetID = 'productModalSelect'; }
		else { targetID = 'selectedQuantitySelect'; }
		const select = document.getElementById(targetID);
		let selectedQuantity = parseInt(select.options[select.selectedIndex].value);

		// 既にカートに同じ商品が入っているとして個数を設定
		let originQuantity = 0;

		// カート内に既に選択商品が存在していた場合
		if (typeof result !== 'undefined') {
			originQuantity = result.value.selectedQuantity;

			selectedQuantity += originQuantity;
			selectedQuantity = Math.min(selectedQuantity, product.stock); // 在庫数を超えないように丸める
		}
		value.selectedQuantity = selectedQuantity;

		// 結果的にカートに入れた増分値を出力
		viewMsgAddtoCart(1, `「${product.name}」× ${(selectedQuantity - originQuantity)} をドローンに積みました。`);

		// オブジェを保存するとただの文字列に変換されてしまうため、JSON文字列に変換
		if (key && value) storage.setItem(key, JSON.stringify(value));

		viewLocalStorage();
	}

	// localStorageからカートの中身のみを昇順でコレクション型で取得
	function getCartContents() {
		return Object.keys(storage)
			.filter(key => /^[0-9]+_productInCart$/.test(key))
			.sort((a, b) => parseInt(a) - parseInt(b))
			.map(key => ({ key: key, value: JSON.parse(storage.getItem(key)) }));
	}

	// カート表示、localStorageのキーと値を取得 + DOM作成
	viewLocalStorage();
	function viewLocalStorage() {
		const cartAreaList = document.getElementById('cartAreaList');
		while (cartAreaList.firstElementChild) cartAreaList.removeChild(cartAreaList.firstElementChild);

		const results = getCartContents();
		const sumPriceArea = document.getElementById('cartAreaSumPrice');
		const sumQuantityArea = document.getElementById('cartAreaSumQuantity');
		let sumPrice = sumSelectedQuantity = 0;
		const insertArr = [];

		if (results.length === 0) {
			const li = createElement('li', [createTextNode(`*「${jsonUserName.name}様のドローンに商品は積まれてません」`)], 'cart-area__item-empty');
			insertArr.push(li);
		}

		for (let i = 0; i < results.length; i++) {
			const result = results[i];

			const img = createElement('img', []);
			img.src = `img/${result.value.imgURL}.png`;

			const div = createElement('div', [img], 'cart-area__img-wrapper');

			// 在庫数分のoption作成
			const optionArr = [];
			for (let i = 0; i <= result.value.stock; i++) {
				const option = createElement('option', [createTextNode(i)]);
				option.value = i;
				if (i === 0) option.textContent = `${i}(削除)`;
				if (i === result.value.selectedQuantity) option.selected = true;
				optionArr.push(option);
			}
			sumSelectedQuantity += result.value.selectedQuantity;

			const select = createElement('select', optionArr, 'cart-area__select');
			select.addEventListener('change', () => {
				if (select.selectedIndex === 0) { // option[0]はカートから削除
					deleteStorage(result.key);
				} else { // localStorage(該当商品のquantity)更新
					const value = JSON.parse(storage.getItem(result.key));
					value.selectedQuantity = select.selectedIndex;
					storage.setItem(result.key, JSON.stringify(value));
				}
				viewLocalStorage();
			});

			const p1 = createElement('p', [createTextNode(result.value.name)], 'cart-area__product-name');

			const price = parseInt(result.value.price) * parseInt(result.value.selectedQuantity);
			sumPrice += price;
			const p2 = createElement('p', [createTextNode(`${price}円`)], 'cart-area__product-price');

			const a = createElement('a', [createTextNode('削除')], 'cart-area__delete-btn');
			// カート内商品削除、localStorageから指定キーに対する値を削除
			a.addEventListener('click', (e) => {
				deleteStorage(result.key);
				e.preventDefault();
			});

			const div2 = createElement('div', [p2, a], 'cart-area__price-delete');

			const li = createElement('li', [div, select, p1, div2], 'cart-area__item');
			insertArr.push(li);
		}
		cartAreaList.appendChild(createFragment(insertArr));

		sumPriceArea.textContent = sumPrice;
		sumQuantityArea.textContent = sumSelectedQuantity;
	}

	function deleteStorage(key) {
		storage.removeItem(key);
		viewLocalStorage();
	}

	// カートリセット、localStorageから全て削除
	document.getElementById('cartAreaResetBtn').addEventListener('click', () => {
		const results = getCartContents();
		for (const result of results) storage.removeItem(result.key);
		viewLocalStorage();
	});

	// カート領域の拡大縮小
	function changeCartAreaHeight(end) {
		let progress = 0;
		const startCartAreaHeight = parseInt(cartAreaStyle.height);
		const endCartAreaHeight = end;
		const diffCartAreaHeight = endCartAreaHeight - startCartAreaHeight;

		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / 200;

				progress = Math.min(progress, 1);

				if (progress > 0) cartArea.style.height = (startCartAreaHeight + diffCartAreaHeight * progress) + 'px';

				if (progress < 1) requestAnimationFrame(update);
			}
		});
	}

	// カートに商品追加時、メッセージ出力
	const viewMessageArea = document.getElementById('viewMessageArea');
	const viewMessageAreaStyle = window.getComputedStyle(viewMessageArea);

	function viewMsgAddtoCart(endOpacity, message) {
		// カートボタン連打時、メッセージ表示の重複回避
		if (!canPrepareAddtoCart) return;
		canPrepareAddtoCart = false;

		viewMessageArea.textContent = message;
		viewMessageArea.style.display = 'inline-block';

		let progress = 0;
		const startOpacity = parseFloat(viewMessageAreaStyle.opacity);
		const diffOpacity = endOpacity - startOpacity;

		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / 500;

				progress = Math.min(progress, 1);

				if (progress > 0) viewMessageArea.style.opacity = startOpacity + diffOpacity * progress;

				if (progress < 1) {
					requestAnimationFrame(update);
				} else {
					if (endOpacity === 0) {
						viewMessageArea.style.display = 'none';
						canPrepareAddtoCart = true;
						return;
					}
					setTimeout(() => {
						canPrepareAddtoCart = true;
						viewMsgAddtoCart(0, message);
					}, 2100);
				}
			}
		});
	}

	// 要素ノード作成ショートカット
	function createElement(tagName, children, className, idName) {
		const elm = document.createElement(tagName);

		if (children.length > 0) children.forEach(child => { elm.appendChild(child); });
		if (className) elm.className = className;
		if (idName) elm.id = idName;

		return elm;
	}

	// テキストノード作成ショートカット
	function createTextNode(txt) { return document.createTextNode(txt); }

	// 毎フレーム実行関数
	function generalTick() {
		// カメラコントローラーを更新
		controls.update();

		camera.lookAt(new THREE.Vector3(0, 0, 0));

		//レンダリング
		renderer.render(scene, camera);

		// 更新が完了したら再度呼び出す
		requestID = requestAnimationFrame(generalTick);
	}

	// 毎フレーム実行関数(店舗用) ///////////////////////////////////////////////////////////////////////
	function storeTick() {
		// カメラコントローラーを更新
		controls.update();

		// ヘルパーを更新
		// lightHelper.update();

		// if(directionalLight){
		//   directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
		//   directionalLight.quaternion.copy(camera.quaternion);
		// }

		// 全てのmodalの向きをカメラに追従させる(どの角度から見ても正面にする)
		// カメラの回転角と回転させたいオブジェを同調させる
		for (let i = 0; i < wrap.children.length; i++) {
			if (wrap.children[i]) wrap.children[i].quaternion.copy(camera.quaternion);
		}

		// 値札表示
		if (productObj.length > 0) {
			canvas.style.cursor = 'pointer';
			priceTagArea.setAttribute('style', `display: inline-block; left: ${screenMouse.x + 30}px; top: ${screenMouse.y - 30}px`);

			const obj = productObj[0].object.parent.name;
			const text = `${obj.name}（${obj.price}円）`;
			if (priceTagArea.textContent !== text) priceTagArea.textContent = text;
		} else {
			canvas.style.cursor = 'auto';
			priceTagArea.setAttribute('style', 'display: none');
		}

		camera.lookAt(new THREE.Vector3(0, 0, 0));

		//レンダリング
		renderer.render(scene, camera);

		// 更新が完了したら再度呼び出す
		requestID = requestAnimationFrame(storeTick);
	}

	// カメラ回転の最大半径を求めるための座標(店舗)
	const inStoreX = 722.0517215086305;
	const inStoreZ = -209.5004772684191;

	let canPrepareStoreBtn = true;

	// 入店する
	function enterStore() {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;
		backStoreBtn.removeEventListener('click', backtoMap);

		// 毎フレーム実行関数切り替え
		cancelAnimationFrame(requestID);
		storeTick();

		// 商品オブジェのピッキング、値札、ドローン領域拡大、縮小を有効にする
		canvas.addEventListener('dblclick', dblclickObj); // 処理がinitに戻った時にremoveする、後で変更
		canvas.addEventListener('mousemove', mousemoveObj); // 上記と同様
		cartArea.addEventListener('mouseover', mouseoverCartArea);
		cartArea.addEventListener('mouseout', mouseoutCartArea);

		new Promise((resolve, reject) => {
			// ドアを超える位置まで移動
			generalCamAnimate(inStoreX, 122.68304740750044, inStoreZ);

			setTimeout(() => { resolve(); }, 1000);
		})
			.then(() => {
				return new Promise((resolve, reject) => {
					backStoreBtn.children[0].textContent = '退店する';
					toggleStoreAreaStyle();

					generalCamAnimate(rackData[0].x, 122.68304740750044, rackData[0].z); // カメラの初期位置まで回転
					setTimeout(() => { resolve(); }, 1000);
				});
			})
			.then(() => {
				backStoreBtn.addEventListener('click', exitStore);
				dragControls.addEventListener('dragstart', dragstartObj);
				dragControls.addEventListener('dragend', dragendObj);
				setControls(inStoreX, inStoreZ);
				
				canPrepareStoreBtn = true;
			})
			.catch((err) => console.log(err));
	}

	const contactFooterArea = document.getElementById('contactFooterArea');

	// ページを表示する(ヘッダー用)
	function enterPage(e) {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;

		backStoreBtn.removeEventListener('click', backtoMap);
		const target = e.currentTarget;

		new Promise((resolve, reject) => {
			generalCamAnimate(14245.513257069308, 2619.5158604219996, 53.65269329670458);
			setTimeout(() => { resolve(); }, 1000);
		})
		.then(() => {
			preStoreBtn.classList.add('pre-store-btn--active');
			nextStoreBtn.classList.add('next-store-btn--active');
			target.classList.add('go-store-btn--active');
			backStoreBtn.children[0].textContent = 'ヘッダーに戻る';
			backStoreBtn.classList.add('back-store-btn--active');
			backStoreBtn.addEventListener('click', exitPage);

			// 表示ページを動的に変更
			let elm = loginArea;
			const text = target.children[1].textContent;
			if (text === 'お問い合わせ') { elm = contactFooterArea; }
			else if (text === 'マイページ') { elm = null } /////////////////////////////////////////マイページ作成後変更
			elm.classList.remove('login-area--active');
			
			canPrepareStoreBtn = true;
		})
		.catch((err) => { console.log(err); });
	}

	function togglePage() {
		
	}

	// ドローン領域拡大
	function mouseoverCartArea() {
		if (cartArea.children[0].children[0].className === 'cart-area__item-empty') return;

		// 商品詳細モーダルが表示されているなら閉じる
		if (productModal.className === 'product-modal product-modal--active') slideModal(-310);

		// 最上部の位置までスクロールして、購入画面移動のずれを抑える
		window.scroll({ top: 0, behavior: 'smooth' });

		changeCartAreaHeight(250);
	}

	// ドローン領域縮小
	function mouseoutCartArea() { changeCartAreaHeight(100); }

	// 画面レイアウト変更(店舗⇔その他)
	function toggleStoreAreaStyle() {
		cartArea.classList.toggle('cart-area--active');
		cambtnArea.classList.toggle('cambtn-area--active');
		dragDropBox.classList.toggle('drag-drop-box--active');
		goStoreBtn.classList.toggle('go-store-btn--active');
		backStoreBtn.classList.toggle('back-store-btn--active');
	}

	// 全体マップに戻る
	function backtoMap(e) {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;

		e.currentTarget.removeEventListener(e.type, backtoMap);
		let currentMapNum = getCurrentMapNum();
		let removeFunc = enterStore;
		if (currentMapNum === 1) {
			removeFunc = enterPage;
			preStoreBtn.removeEventListener('click', rotateHeaderMap);
			nextStoreBtn.removeEventListener('click', rotateHeaderMap);
		}
		goStoreBtn.removeEventListener('click', removeFunc);

		generalCamAnimate(15418.48051386267, 18296.12998481804, -9363.483558792053); // 後で調整

		setTimeout(() => {
			cancelAnimationFrame(requestID);
			mapTick();

			let addFunc = goStore;
			let text = '出発する';
			if (currentMapNum === 1) {
				addFunc = goHeader;
				text = 'ヘッダーを見る';
				preStoreBtn.children[0].textContent = '神奈川マップ';
				nextStoreBtn.children[0].textContent = '東京マップ';
				preStoreBtn.addEventListener('click', updateWorld);
				nextStoreBtn.addEventListener('click', updateWorld);

				// ヘッダーマップの回転を初期化
				mapWrap.children[1].rotation.y = 0;
			} else {
				preStoreBtn.classList.toggle('pre-store-btn--active');
				nextStoreBtn.classList.toggle('next-store-btn--active');
			}
			goStoreBtn.addEventListener('click', addFunc);
			goStoreBtn.children[1].textContent = text;
			backStoreBtn.children[0].innerHTML = '&minus;';

			canPrepareStoreBtn = true;
		}, 1000);
	}

	// 店舗外座標
	const outStoreX = 2780.9729880045456;
	const outStoreY = 888.2437839272408;
	const outStoreZ = -817.3945575723257;

	// 退店する
	function exitStore(e) {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;

		// 店に入る前の設定に戻す
		e.currentTarget.removeEventListener(e.type, exitStore);
		priceTagArea.style.display = 'none';
		if (productModal.className === 'product-modal product-modal--active') slideModal(-310);
		removeControls();
		cancelAnimationFrame(requestID);
		generalTick();

		// ドアを超えた先まで移動
		new Promise((resolve, reject) => {
			generalCamAnimate(inStoreX, 122.68304740750044, inStoreZ);
			setTimeout(() => { resolve(); }, 1000);
		})
			.then(() => {
				return new Promise((resolve, reject) => {
					backStoreBtn.children[0].textContent = 'マップに戻る';
					toggleStoreAreaStyle();
					// 店舗前まで移動
					generalCamAnimate(outStoreX, outStoreY, outStoreZ);
					setTimeout(() => { resolve(); }, 1000);
				});
			})
			.then(() => {
				backStoreBtn.addEventListener('click', backtoMap);
				canPrepareStoreBtn = true;
			})
			.catch((err) => console.log(err));
	}

	// ページから離れる
	function exitPage(e) {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;
		e.currentTarget.removeEventListener(e.type, exitPage);

		new Promise((resolve, reject) => {
			// 表示中のページを非表示
			let elm = loginArea;
			if (signupArea.className === 'login-area signup-area') { elm = signupArea; }
			else if (contactFooterArea.className === 'contact-footer-area') { elm = contactFooterArea; }
			elm.classList.add('login-area--active');

			// 視点を戻す
			generalCamAnimate(25044.85046768492, 4605.336560228284, 94.32609808830206);
			setTimeout(() => { resolve(); }, 1000);
		})
		.then(() => {
			preStoreBtn.classList.remove('pre-store-btn--active');
			nextStoreBtn.classList.remove('next-store-btn--active');
			goStoreBtn.classList.remove('go-store-btn--active');
			backStoreBtn.addEventListener('click', backtoMap);
			backStoreBtn.children[0].textContent = 'マップに戻る';
			backStoreBtn.classList.remove('back-store-btn--active');

			canPrepareStoreBtn = true;
		})
		.catch((err) => { console.log(err); });
	}

	const priceTagArea = document.getElementById('priceTagArea');
	const dragDropBox = document.getElementById('dragDropBox');
	const goStoreBtn = document.getElementById('goStoreBtn');
	const backStoreBtn = document.getElementById('backStoreBtn');
	const currentMapName = document.getElementById('currentMapName');
	const preStoreBtn = document.getElementById('preStoreBtn');
	const nextStoreBtn = document.getElementById('nextStoreBtn');

	goStoreBtn.addEventListener('click', goStore);

	// 出発する
	function goStore(e) {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;

		e.currentTarget.removeEventListener(e.type, goStore);
		displayArea.style.zIndex = 1; // 全画面に戻った時に元に戻す
		preStoreBtn.classList.toggle('pre-store-btn--active');
		nextStoreBtn.classList.toggle('next-store-btn--active');

		// 毎フレーム実行関数切り替え
		cancelAnimationFrame(requestID);
		generalTick();

		// 店舗前まで移動
		generalCamAnimate(outStoreX, outStoreY, outStoreZ);

		// マップ操作ボタン更新
		setTimeout(() => {
			goStoreBtn.addEventListener('click', enterStore);
			backStoreBtn.addEventListener('click', backtoMap);
			goStoreBtn.children[1].textContent = '入店する';
			backStoreBtn.children[0].textContent = 'マップに戻る';

			canPrepareStoreBtn = true;
		}, 1000);
	}

	// 出発する(ヘッダー用)
	function goHeader(e) {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;

		e.currentTarget.removeEventListener(e.type, goHeader);
		preStoreBtn.removeEventListener('click', updateWorld);
		nextStoreBtn.removeEventListener('click', updateWorld);

		displayArea.style.zIndex = 1; // 全画面に戻った時に元に戻す
		preStoreBtn.children[0].textContent = 'お問い合わせ';
		nextStoreBtn.children[0].textContent = 'マイページ';

		// 毎フレーム実行関数切り替え
		cancelAnimationFrame(requestID);
		generalTick();

		// ヘッダーの手前ページ前まで移動
		generalCamAnimate(25044.85046768492, 4605.336560228284, 94.32609808830206);

		// マップ操作ボタン更新
		setTimeout(() => {
			preStoreBtn.addEventListener('click', rotateHeaderMap);
			nextStoreBtn.addEventListener('click', rotateHeaderMap);
			goStoreBtn.addEventListener('click', enterPage);
			backStoreBtn.addEventListener('click', backtoMap);
			goStoreBtn.children[1].textContent = 'ログイン';   ////////////////////
			backStoreBtn.children[0].textContent = 'マップに戻る';

			canPrepareStoreBtn = true;
		}, 1000);
	}

	for (const btn of document.getElementsByClassName('command1')) btn.addEventListener('click', updateWorld);

	// 店舗移動
	function updateWorld(e) {
		if (!canPrepareStoreBtn) return;
		canPrepareStoreBtn = false;

		const target = e.currentTarget;
		const btnData = parseInt(target.dataset.main);
		const currentMapNum = getCurrentMapNum();
		const selectMapNum = selectStoreNum(btnData, currentMapNum);

		// マップのstateを更新
		maps[mapsKeyArr[currentMapNum]].state = false;
		maps[mapsKeyArr[selectMapNum]].state = true;
		
		cancelAnimationFrame(requestID); // mapTick停止
		generalTick();

		// 同期アニメーション実行
		new Promise((resolve, reject) => {
			// カメラをz軸と平行の位置に移動
			generalCamAnimate((x + 30000), (y + 20000), 0);

			// 表示中のマップを中心から円周上(手前)に移動
			moveEachMap(mapWrap.children[currentMapNum], worldRadius);

			setTimeout(() => { resolve(); }, 1000);
		})
			.then(() => {
				return new Promise((resolve, reject) => {
					rotateAllMap(btnData);

					setTimeout(() => { resolve(); }, 2000);
				});
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					// カメラを3次元極座標上に戻す
					generalCamAnimate(x, y, z);

					// 選択されたマップを円周上(手前)から中心に移動
					moveEachMap(mapWrap.children[selectMapNum], 0);

					setTimeout(() => { resolve(); }, 1000);
				});
			})
			.then(() => {
				cancelAnimationFrame(requestID); // generalTick停止
				mapTick();
				
				updateStoreBtnsText(btnData, target, currentMapName);
				
				// ヘッダーマップの場合、テキスト・イベント切り替え
				let removeFunc = goHeader;
				let addFunc = goStore;
				let text = '出発する';
				if (getCurrentMapNum() === 1) {
					removeFunc = goStore;
					addFunc = goHeader;
					text = 'ヘッダーを見る';
				}
				goStoreBtn.removeEventListener('click', removeFunc);
				goStoreBtn.addEventListener('click', addFunc);
				goStoreBtn.children[1].textContent = text;

				canPrepareStoreBtn = true;
			})
			.catch((err) => console.log(err));
	}

	// マップ操作ボタンのテキスト更新
	function updateStoreBtnsText(btnData, targetElm, tempElm) {
		const tempText = tempElm.textContent;
		let varElm = preStoreBtn;
		if (btnData === -1) varElm = nextStoreBtn;

		tempElm.textContent = targetElm.children[0].textContent;
		targetElm.children[0].textContent = varElm.children[0].textContent;
		varElm.children[0].textContent = tempText;
	}

	// 新しいマップ位置を取得
	const worldRadius = 40183.7599970082;
	function getNewPosition(deg) {
		const radian = deg * Math.PI / 180;
		const x = worldRadius * Math.cos(radian);
		const z = worldRadius * Math.sin(radian);
		return new THREE.Vector3(x, -70, z);
	}

	// 現在のマップ番号を取得
	function getCurrentMapNum() {
		for (let i = 0; i < mapsKeyArr.length; i++) {
			if (maps[mapsKeyArr[i]].state) return i;
		}
	}

	// 全てのマップ位置を更新
	function rotateAllMap(btnData) {
		const startDegs = [];
		for (let i = 0; i < mapsKeyArr.length; i++) startDegs.push(maps[mapsKeyArr[i]].deg);

		let diffDeg = 120;
		if (btnData === -1) diffDeg = -120;

		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / 2000;

				progress = Math.min(progress, 1);

				if (progress > 0) {
					for (let i = 0; i < mapsKeyArr.length; i++) {
						maps[mapsKeyArr[i]].deg = startDegs[i] + diffDeg * progress;
						mapWrap.children[i].position.copy(getNewPosition(maps[mapsKeyArr[i]].deg));
					}
				}

				if (progress < 1) {
					requestAnimationFrame(update);
				} else {
					// 初期状態から1周してたら初期化
					// let resetValue = 0;
					// if(maps[mapsKeyArr[2]].deg === -180){ resetValue = 360; }
					// else if(maps[mapsKeyArr[2]].deg === 540){ resetValue = -360; }
					// else{ return; }

					// for(let i = 0; i < mapsKeyArr.length; i++) maps[mapsKeyArr[i]].deg += resetValue;
				}
			}
		});
	}

	// マップオブジェクトを円周上⇔円の中心間で移動
	function moveEachMap(target, endX) {
		let progress = 0;
		const startX = target.position.x;
		const diffX = endX - startX;

		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / 1000;

				progress = Math.min(progress, 1);

				if (progress > 0) target.position.copy(new THREE.Vector3((startX + diffX * progress), -70, 0));

				if (progress < 1) requestAnimationFrame(update);
			}
		});
	}

	// 選択されたマップの番号を取得
	function selectStoreNum(btnData, currentMapNum) {
		if (btnData === -1 && currentMapNum === 0) {
			currentMapNum = mapsKeyArr.length;
		} else if (btnData === 1 && currentMapNum === (mapsKeyArr.length - 1)) {
			currentMapNum = -1;
		}
		return currentMapNum + btnData;
	}

	// ヘッダーマップ回転
	function rotateHeaderMap(e) {
		let progress = 0;
		const startDeg = mapWrap.children[1].rotation.y;
		const target = e.currentTarget;
		const btnData = parseInt(target.dataset.main);
		const diffDeg = (Math.PI / 1.5) * -btnData;

		requestAnimationFrame(startTime => {
			update(startTime);

			function update(timeStamp) {
				// 進捗率 = 経過した時間 / 変化にかかる総時間
				progress = (timeStamp - startTime) / 1000;

				progress = Math.min(progress, 1);

				if (progress > 0) mapWrap.children[1].rotation.y = startDeg + diffDeg * progress;

				if (progress < 1) { requestAnimationFrame(update); }
				else { updateStoreBtnsText(btnData, target, goStoreBtn.children[1]); }
			}
		});
	}

	// 購入処理 ////////////////////////////////////////////////////////////////////////////////
	const loginAreaError = document.getElementById('loginAreaError');
	const orderArea = document.getElementById('orderArea');
	const orderDetails = document.getElementById('orderDetails');

	// 購入ボタンクリック後の処理
	document.getElementById('cartAreaRegiBtn').addEventListener('click', () => {
		// カートの中身が0なら何もしない
		if (getCartContents().length === 0) return;

		// ゲストユーザならログイン画面へ誘導
		if (jsonUserName.name === 'ゲスト') {
			loginAreaError.textContent = 'ログインしてください。';
			return;
		}

		orderArea.classList.add('order-area--active');
		window.scrollBy(0, window.innerHeight);
	});

	// viewOrderBtnが押された時
	document.getElementById('viewOrderBtn').addEventListener('click', (e) => {
		// 表示変更
		e.currentTarget.classList.add('order-area__view-order-btn--active');
		orderDetails.classList.add('order-area__order-details--active');

		const items = getCartContents();
		console.log(items);

		const insertArr = [];
		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			const img = createElement('img', []);
			img.src = `img/${item.value.imgURL}.png`;

			const imgDiv = createElement('div', [img], 'order-area__cart__item__img-div');

			const leftDiv = createElement('div', [imgDiv], 'order-area__cart__item__left');

			const name = createElement('p', [createTextNode(item.value.name)], 'order-area__cart__item__name');

			const price = createElement('p', [createTextNode(item.value.price + '円')], 'order-area__cart__item__price');

			const optionArr = [];
			for (let i = 0; i <= item.value.stock; i++) {
				const option = createElement('option', [createTextNode(i)]);
				option.value = i;
				if (i === 0) option.textContent = `${i}(削除)`;
				if (i === item.value.selectedQuantity) option.selected = true;
				optionArr.push(option);
			}

			const select = createElement('select', optionArr, 'order-area__cart__item__select');

			const rightDiv = createElement('div', [name, price, select], 'order-area__cart__item__right');

			const li = createElement('li', [leftDiv, rightDiv], 'order-area__cart__item');

			insertArr.push(li);
		}
		orderDetails.children[0].appendChild(createFragment(insertArr));
	});


	for (const item of document.getElementsByClassName('order-area__details__item__content__title')) {
		item.addEventListener('click', (e) => {
			e.currentTarget.previousElementSibling.style.height = 120 + 'px';
		});
	}

	// ログイン画面と新規登録画面の切り替え
	const loginArea = document.getElementById('loginArea');
	const signupArea = document.getElementById('signupArea');
	const loginForm = document.loginForm;
	const signupForm = document.signupForm;
	const signupAreaError = document.getElementById('signupAreaError');

	// 未ログインの場合のみ実行する
	if (document.getElementById('switchSignupAreaBtn')) {
		document.getElementById('switchSignupAreaBtn').addEventListener('click', () => {
			loginForm.reset();
			loginArea.classList.add('login-area--active');
			signupArea.classList.remove('login-area--active');
		});
	}

	document.getElementById('switchLoginAreaBtn').addEventListener('click', () => {
		if (!confirm('フォーム内容が初期化されます。\nよろしいですか？')) return;
		signupForm.reset();
		signupAreaError.textContent = '';
		loginArea.classList.remove('login-area--active');
		signupArea.classList.add('login-area--active');
	});

	// 新規登録画面の送信時、パスワードと確認用パスワードの一致チェック
	signupForm.addEventListener('submit', (e) => {
		if (signupForm.password.value === signupForm.confirm_password.value) return;
		signupAreaError.textContent = 'パスワードと確認用パスワードが一致していません。'
		e.preventDefault();
	});


	// 調査用 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	document.getElementById('logoArea').addEventListener('click', (e) => {
		console.log(scene.children);
		console.log(typeof scene.children);
		console.log(scene.getObjectByName('drone'));
		scene.getObjectByName('drone').visible = !scene.getObjectByName('drone').visible;
		// console.log(mapWrap.children);
		// console.log(tokyoDeg);
		// console.log(model.position);
		console.log(`${camera.position.x}, ${camera.position.y}, ${camera.position.z}`);
		// console.log(`x: ${camera.position.x}, z: ${camera.position.z}`);
		// console.log(window.getComputedStyle(document.querySelector('.drag-drop-box__img')));
		// window.scrollBy(0, window.innerHeight)
		// console.log(controls.enabled);
		// console.log(controls);
		// console.log(mapWrap.children);
		e.preventDefault();
	})

}

/*
機能
drag&dropのaddLocalStorageのとこ

デザイン
worldの各マップのモデル(blender)
cambtn写メ参照(youtubeのnav)
小計・合計のとこ

全て
drone, login, contact
*/