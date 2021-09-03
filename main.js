//定義狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

//定義花色
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

//view 是物件
const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
 },
  getCardContent(index) {
     //生成卡片內容,花色,數字
     const number = this.transformNumber((index % 13) + 1)
    //使用Math.floor取整數
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>`
  },
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
      return number
    }
  },
  // 1.選出cards並抽換內容
  // 2.用MAP迭代陣列，將數字丟進view.getCardElement() 產生52張卡片陣列
  // 3.用join("")把陣列合併字串，才能當HTML template 使用
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
  },
  flipCards(...cards){ cards.map(card => {
    if(card.classList.contains('back')) {
      //回傳正面
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    } 
    //回傳背面
    card.classList.add('back')
    card.innerHTML = null
   })
  },
 

  //配對成功樣式變化
   pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
   renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`
  },
  
   renderTriedTimes(times) {
     document.querySelector(".tried").innerHTML = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map (card => {
    card.classList.add('wrong')
    card.addEventListener('animationend', event =>
    event.target.classList.remove('wrong'), {once: true})
    })
  },
  showGameFinished() {
    const div = document.createElement('div') 
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p> score:${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
  },
  
  score: 0,
  triedTimes: 0

}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  
  //依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    //檢查,如果沒有牌背class就直接結束
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        if(model.isRevealedCardsMatched()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
           view.pairCards(...model.revealedCards)
           model.revealedCards = []
           if (model.score === 260) {
             console.log('showGameFinished')
             this.currentState = GAME_STATE.FirstCardAwaits
             view.showGameFinished()
             return
           }
           this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
          console.log(this.resetCards)
        }
        break
    } 
  console.log('this.currentState', this.currentState)
  console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

   resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}
//洗牌
const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()
//nodeList
document.querySelectorAll('.card').forEach(card =>{
  card.addEventListener('click', event =>{
    controller.dispatchCardAction(card)
  })
})