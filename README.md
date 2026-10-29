# swsswwssswww_sg
> **Sound Wave Super Synthesizer — Waveform Workflow, Signal Sequencing Studio — World Wide Web**  
> WatanabeShinichiro 向け 高精度PWA音源生成機 (ChromeOS / PC / Mobile)

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2ea44f?style=for-the-badge&logo=github)](https://kikuchimakoto.github.io/swsswwssswww_sg/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-f472b6?style=for-the-badge&logo=bun)](https://bun.sh/)
[![Vite 6](https://img.shields.io/badge/Bundler-Vite_6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/Framework-React_19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS_v3-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Workbox_Offline-orange?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🔗 Live Demo
ブラウザから直接インストール・動作確認が可能です：  
👉 **[https://kikuchimakoto.github.io/swsswwssswww_sg/](https://kikuchimakoto.github.io/swsswwssswww_sg/)**

---

## 🏷️ バックロニム定義 (12-Letter Backronym Breakdown)

本プロジェクトの名称 **`swsswwssswww`**（全12文字）は、以下の正式バックロニム（Backronym）を表しています：

> **Sound Wave Super Synthesizer — Waveform Workflow, Signal Sequencing Studio — World Wide Web**

### 構成セグメント (3 Segments)
- **`SWSS`**: **Sound Wave Super Synthesizer**（サイン波・三角波・矩形波・スイープを発振する高精度Web Audioシンセサイザーコア）
- **`WWSSS`**: **Waveform Workflow, Signal Sequencing Studio**（波形・シーケンス・バースト・オシロスコープ統合スタジオ環境）
- **`WWW`**: **World Wide Web**（ブラウザ・ChromeOS・PC・スマートフォンで即座に動作するPWA / Web Audio API ネイティブ実装）

### 12文字の対応表 (Letter Correspondence)

| 位置 | 文字 | 対応単語 (Word) | セグメント |
| :---: | :---: | :--- | :--- |
| 1 | **S** | Sound | **SWSS** (Sound Wave Super Synthesizer) |
| 2 | **W** | Wave | |
| 3 | **S** | Super | |
| 4 | **S** | Synthesizer | |
| 5 | **W** | Waveform | **WWSSS** (Waveform Workflow, Signal Sequencing Studio) |
| 6 | **W** | Workflow | |
| 7 | **S** | Signal | |
| 8 | **S** | Sequencing | |
| 9 | **S** | Studio | |
| 10 | **W** | World | **WWW** (World Wide Web) |
| 11 | **W** | Wide | |
| 12 | **W** | Web | |

---

## 📖 プロジェクト概要 (Overview)

**swsswwssswww - WatanabeShinichiro 向け 音源生成機 (Sound Generator)** は、Web Audio APIを活用してブラウザ上で高精度なオーディオ信号をリアルタイム生成するプロフェッショナル仕様のPWAアプリケーションです。

音響機器のキャリブレーション、スピーカーやヘッドホンのエージング・周波数特性測定、聴力チェック、物理実験、シンセサイザーの信号検証など、多様なユースケースに対応します。モダンなダークテーマUIを備え、ChromeOS、PC（Windows / macOS / Linux）、スマートフォン（iOS / Android）のあらゆる画面サイズで直感的に操作できます。

---

## ✨ 機能一覧 (Features)

### 1. 4波形対応 (4 Waveforms)
- **サイン波 (Sine)**: 高純度な基本波形。歪み測定や周波数応答チェック、リファレンストーンに最適。
- **三角波 (Triangle)**: 奇数次倍音を含み、サイン波よりも輪郭のあるソフトなトーン。
- **矩形波 (Square)**: 豊富な倍音成分を含み、デジタル回路やスピーカーのトランジェント試験に有用。
- **スイープ (Frequency Sweep / Chirp)**:
  - 開始周波数 (20 Hz 〜 20,000 Hz) および 終端周波数 (20 Hz 〜 20,000 Hz) を個別に指定可能。
  - スイープ時間設定: 0.1秒 〜 1000.0秒 (最大1000秒 / 約16分40秒までの長時間発振設定に対応)。
  - 変化スケール切り替え: **対数 (Logarithmic)** / **線形 (Linear)**。
  - 反転 (Swap) ボタン: 開始周波数と終端周波数をワンタップで瞬時に入れ替え可能。

### 2. 3再生モード (3 Play Modes)
- **連続発振 (Continuous Loop)**: 停止ボタンを押すまで持続的に波形を発振。
- **周期バースト (Periodic Burst)**:
  - **波数指定（基本1波 / デフォルト）**: 周波数に同期した波長単位でのパルス発振
  - **秒数指定**: 任意のミリ秒単位での発振設定
  - **リアルタイム換算表示**: リアルタイムでの実時間(ms) / 波数換算表示
  - 休止時間 (Pause): 10 ms 〜 5,000 ms の範囲でミリ秒単位設定可能。
  - 周期的なトーンバーストによる過渡応答測定や聴覚刺激テストに対応。
- **単発出力 (One-shot)**:
  - 設定した発振時間（または指定波数、スイープ選択時はスイープ時間）だけ鳴動して自動的に停止。
  - **長時間発振対応**: 最大1000秒（約16分40秒）までの長時間発振設定に対応。対数スライダーと豊富なクイックプリセットを完備。

### 3. 周波数制御 (Frequency Controls)
- **広範な発振帯域**: 人間の可聴全帯域である **20 Hz 〜 20,000 Hz** をカバー。
- **対数スライダー**: 人間の聴覚特性に合わせた対数スライダーにより、低周波域でもミリ単位の直感的な微調整が可能。
- **高精度手打ち入力**: 1 Hz 単位で数値を直接入力可能。`±1 Hz` / `±10 Hz` のステップボタンも完備。
- **ワンタッチ・クイックプリセット**:
  - `100 Hz` (低域チェック)
  - `440 Hz` (基準音 A4 / チューニング)
  - `1 kHz` (標準リファレンストーン)
  - `5 kHz` (中高域チェック)
  - `10 kHz` (高域チェック)
  - `15 kHz` (超高域・耳年齢チェック)

### 4. 音量制御と過大音量保護 (Volume Control & Protection)
- **無段階ゲイン制御**: 0% 〜 100% の連続スライダーおよび数値入力。
- **デシベル (dB) 換算表示**: デジタルフルスケールに基づき `-∞ dB` 〜 `0.0 dB` をリアルタイム表示。
- **ワンタップ消音 (Mute)**: 現在の音量値を保持したまま即時消音。
- **音量プリセット**: `10%`, `25%`, `50%`, `75%`, `100%` をワンタップで選択。
- **過大音量警告 (Safety Warning)**: 音量が **90% 以上** に達すると、警告アイコンとカラー表示で聴覚保護およびスピーカー保護の注意を喚起。

### 5. 音声出力アーキテクチャ (Audio Engine Architecture)
- **Web Audio API ネイティブ**: ブラウザ標準の低遅延オーディオパイプライン (`AudioContext` -> `OscillatorNode` -> `GainNode` -> `AnalyserNode` -> `destination`) を構築。
- **プライマリデバイス出力**: OSの既定オーディオ出力デバイス（スピーカー、ヘッドホン、外部DAC）へダイレクト出力。
- **クリックノイズ防止ソフトエンベロープ (De-clicking Soft Envelope)**:
  - 音の開始時・停止時・バースト切替時に 5 ms のリニアゲインランプを適用。
  - 発振・停止に伴う不快な「プチッ」というトランジェントクリックノイズを完全に抑制。

### 6. オシロスコープ (Real-time Visualizer)
- **HTML5 Canvas 波形モニター**: `AnalyserNode` から取得した時間領域波形データ (Time-Domain Data, FFT 2048) を 60fps で滑らかにリアルタイムレンダリング。
- **測定器ライクなデザイン**: レティクル（中心十字線）およびオシロスコープ風グリッドを背景に配置。
- **HiDPI (Retina / 4K) 対応**: `window.devicePixelRatio` に追従し、高精細ディスプレイでもボケない鮮明な描画を実現。

### 7. 操作性・UX (User Experience)
- **スペースキートグル**: `[Space]` キーで音声出力の開始／停止を即座にトグル（テキスト入力欄フォーカス時は誤作動を防止）。
- **完全レスポンシブ UI**: デスクトップ・Chromebookの横長大画面からスマートフォンの縦長画面まで最適なレイアウトで自動配置。
- **タッチ操作対応**: スライダーやボタンは指でのタップに適した十分なタップターゲットサイズを確保。

### 8. PWA & 完全オフライン対応 (Progressive Web App)
- **オフライン動作**: `vite-plugin-pwa` (Workbox) による Service Worker プリキャッシュにより、通信環境のない完全オフライン環境（機内、電波の届かない防音室や実験室など）でも全機能が動作。
- **スタンドアロンインストール**: ChromeOS, Android, iOS, Windows, macOS でアプリとしてホーム画面やシェルフにインストール可能。
- **専用アセット**: マスク対応アイコン (`maskable-icon-512x512.png`)、Apple Touch Icon、SVG Favicon を同梱。

---

## 🛠️ 技術スタック (Tech Stack)

| カテゴリ | 使用技術 | 説明 |
| :--- | :--- | :--- |
| **Runtime / Package Manager** | [Bun](https://bun.sh/) (v1.3+) | 高速なJavaScript/TypeScriptランタイム & パッケージマネージャー |
| **Bundler & Dev Server** | [Vite 6 / 8](https://vitejs.dev/) | 高速なHMRと最適化された静的アセットビルド |
| **UI Framework** | [React 19](https://react.dev/) | 最新のReactコンポーネント設計 |
| **Type System** | [TypeScript](https://www.typescriptlang.org/) | 厳格な型安全性の担保 |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) | ユーティリティファーストCSSによるダークモードデザイン |
| **PWA Engine** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) | Service Worker自動登録とアセットのオフラインキャッシュ |
| **Sound Synthesis** | Web Audio API | ブラウザネイティブのオシレーター & アナライザーパイプライン |
| **Icons** | [Lucide React](https://lucide.dev/) + Custom SVG | 軽量でモダンなベクターアイコンセット |
| **Test Runner** | `bun:test` | 高速な内蔵ユニットテスト実行環境 |

---

## 📁 ディレクトリ構成 (Project Structure)

```text
swsswwssswww_sg/
├── .github/                      # GitHub設定
├── public/                       # 静的配信アセット
│   ├── .nojekyll                 # GitHub PagesでのJekyll処理防止ファイル
│   ├── favicon.svg               # ベクターファビコン
│   ├── favicon.ico               # レガシー用ファビコン
│   ├── apple-touch-icon.png      # iOS用ホーム画面アイコン (180x180)
│   ├── pwa-192x192.png           # PWA標準アプリアイコン (192x192)
│   ├── pwa-512x512.png           # PWA高解像度アプリアイコン (512x512)
│   └── maskable-icon-512x512.png # Android向けマスク対応アプリアイコン
├── scripts/                      # 自動化スクリプト
│   ├── deploy.ts                 # GitHub Pages単一コミット自動デプロイスクリプト
│   └── generate-icons.ts         # SVGからPNGアプリアイコン一括生成スクリプト
├── src/
│   ├── audio/                    # オーディオエンジン層 (Web Audio API)
│   │   ├── types.ts              # オーディオ設定・波形・モードの型定義
│   │   ├── utils.ts              # 周波数/対数スライダー変換・dB計算・clamp
│   │   ├── utils.test.ts         # ユーティリティ関数のユニットテスト
│   │   ├── AudioEngine.ts        # シングルトンAudioEngine実装 (発振/変調/解析)
│   │   ├── AudioEngine.test.ts   # AudioEngineライフサイクルのモックテスト
│   │   └── index.ts              # オーディオモジュール外部エクスポート
│   ├── components/               # React UIコンポーネント群
│   │   ├── Header.tsx            # ヘッダー (タイトル、出力デバイス情報、稼働バッジ)
│   │   ├── OutputButton.tsx      # メイン出力トグルボタン ([Space] キー操作対応)
│   │   ├── Visualizer.tsx        # Canvas リアルタイム波形モニター (オシロスコープ)
│   │   ├── WaveformSelector.tsx  # 4波形切り替えセレクター
│   │   ├── PlayModeSelector.tsx  # 3再生モード切り替えセレクター
│   │   ├── FrequencyControl.tsx  # 周波数対数スライダー & 数値入力 & プリセット
│   │   ├── SweepControls.tsx     # スイープ専用パラメーター設定
│   │   ├── BurstControls.tsx     # バースト / 単発時間パラメーター設定
│   │   └── VolumeControl.tsx     # 音量スライダー、dB表示、ミュート、過大警告
│   ├── App.tsx                   # メインアプリケーションコンポーネント
│   ├── main.tsx                  # Reactエントリポイント
│   ├── index.css                 # Tailwind CSSディレクティブ & グローバルスタイル
│   ├── pwa.test.ts               # PWAマニフェスト・メタタグ・アイコン解像度テスト
│   └── vite-env.d.ts             # Vite型定義
├── index.html                    # メインHTML (PWAメタタグ・マニフェストリンク)
├── package.json                  # プロジェクト依存関係と各種スクリプト定義
├── postcss.config.js             # PostCSS設定 (TailwindCSS, Autoprefixer)
├── tailwind.config.js            # Tailwind CSS設定
├── tsconfig.json                 # TypeScriptコンパイラ設定
└── vite.config.ts                # Vite & PWA (Workbox) 設定
```

---

## 🚀 環境構築 & 各種コマンド (Getting Started & Commands)

### 前提条件 (Prerequisites)
- [Bun](https://bun.sh/) (v1.0 以上推奨)

### 1. リポジトリのクローン & 依存パッケージのインストール
```bash
git clone https://github.com/KikuchiMakoto/swsswwssswww_sg.git
cd swsswwssswww_sg
bun install
```

### 2. ローカル開発サーバーの起動
ローカルサーバーを起動し、ブラウザでホットリロード開発を行えます。
```bash
bun run dev
```
起動後、ブラウザで `http://localhost:5173/` にアクセスします。

### 3. ユニットテストの実行
AudioEngine、対数周波数計算、dB変換、およびPWAアセット整合性テストを一括実行します。
```bash
bun test
```

### 4. プロダクションビルド
TypeScriptの型チェックを行い、本番用静的アセットを `dist/` に生成します。Service Worker も自動生成されます。
```bash
bun run build
```

### 5. ビルド成果物のローカルプレビュー
生成された `dist/` の成果物をローカルWebサーバーでプレビューします。
```bash
bun run preview
```

### 6. GitHub Pages へのデプロイ
プロダクションビルドを実行し、GitHub Pages (`gh-pages` ブランチ) へ単一コミットで強制プッシュします。
```bash
bun run deploy
```

---

## 🚢 GitHub Pages 単一コミット デプロイ仕様 (Single-Commit Deployment Mechanism)

本プロジェクトでは、静的ビルド成果物管理のために `scripts/deploy.ts` による **単一コミット（Single-Commit）強制プッシュ方式** を採用しています。

### なぜ単一コミットなのか？
ビルドされた静的ファイル（JSバンドル、CSS、HTML、Service Worker等）を通常のGitコミット履歴として蓄積し続けると、コミット履歴が膨大になり、リポジトリの容量が肥大化します。  
本プロジェクトのデプロイスクリプトは、毎回最新の `dist/` 成果物**のみ**を含む1コミットを新規に作成し、リモートの `gh-pages` ブランチへ強制プッシュ (`git push -f`) します。

### デプロイ処理の実行フロー (`scripts/deploy.ts`)
1. **リモートリポジトリURLの取得**: 現在の `git config --get remote.origin.url` からリモートURLを動的に検出。
2. **クリーンビルド**: `bun run build` を実行し、最新の `dist/` ディレクトリを生成。
3. **Jekyll処理防止**: GitHub Pagesでアンダースコア付きファイルが無視されないよう、`dist/.nojekyll` を自動配置。
4. **Gitリポジトリの一時初期化**: `dist/` ディレクトリ内で独立した `gh-pages` ブランチのGitリポジトリを新規初期化 (`git init -b gh-pages`)。
5. **単一コミットの作成**:
   - コミッター情報を設定 (`Makoto KUNO <mkt755778@gmail.com>`)
   - 成果物すべてをステージング (`git add -A`)
   - タイムスタンプ付きの単一コミットを作成 (`deploy: static assets for GitHub Pages (<timestamp>)`)
6. **リモートへの強制プッシュ**: リモートの `gh-pages` ブランチへ `git push -f origin gh-pages` を実行。
7. **一時メタデータのクリーンアップ**: `dist/.git` を削除し、ローカル作業ツリーをクリーンに保ちます。

---

## 👤 制作者情報 (Author & Information)

- **作者 (Author)**: Makoto KUNO
- **メール (Email)**: [mkt755778@gmail.com](mailto:mkt755778@gmail.com)
- **リポジトリ (Repository)**: [https://github.com/KikuchiMakoto/swsswwssswww_sg](https://github.com/KikuchiMakoto/swsswwssswww_sg)

---

## 📄 ライセンス (License)

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。
