import { render } from "solid-js/web";
import { createSignal, For, createEffect } from "solid-js";
import { createStore  } from "solid-js/store"

const Icon = {free: "💸", hover: "🛸", click: "👆"}

const originalGame = {
  count: 0,
  bonus: {free:1, hover:3, click:10},
  buyStuff: [
    createItem("👵", "Granny", 6, 80, "free"),
    createItem("👦", "Little Boy", 20, 300, "hover"),
    createItem("🧑‍💻", "Cookie Developer", 35, 1_000, "click"),
    createItem("🥠", "Fortunate Cookies", 25, 3_000, "free"),
    createItem("🌑", "Cookie Moon", 75, 10_000, "hover"),
    createItem("🪐", "Cookie Planet", 200, 100_000, "click"),
  ]
}

const [game, setGame] = createStore<typeof originalGame>(JSON.parse(JSON.stringify(originalGame)))
type Bonus = {free:number, hover:number, click:number}
type Item = ReturnType<typeof createItem>
function createItem(emoji:string, name:string, bonusAmount:number, cost:number, bonusType: keyof Bonus) {
  return { 
    emoji, name, bonusAmount, cost, bonusType
  }
}
function canBuy(item: Item) {
  return game.count > item.cost
}

const updateGame = {
  add(amount:number) {
    setGame("count", game.count + amount)
  },
  subtract(amount:number) {
    setGame("count", game.count - amount)
  },
  increasePrice(increaseBy:number, id:number) {
    const newAmount = Math.round(increaseBy * game.buyStuff[id].cost)
     setGame("buyStuff", id, "cost", newAmount)
  },
  buyItem(id:number) {
    const item = game.buyStuff[id]
    if (!canBuy(item)) return
    updateGame.subtract(item.cost)
    setGame("bonus", item.bonusType, game.bonus[item.bonusType] + item.bonusAmount) 
    updateGame.increasePrice(1.5, id)
  },
  resetGame() {
    setGame(JSON.parse(JSON.stringify(originalGame)))
  }
}
function useLocalStorage() {
  // updates local storage when game changes
  createEffect(() => localStorage.setItem('game', JSON.stringify(game)))
  // sets the game from storage when starting up
  let json = localStorage.getItem("game")
  if (!json) json = JSON.stringify(originalGame)
  setGame(JSON.parse(json))
}
function Counter() {
  useLocalStorage()
  
  const [hoverActive, setHoverActive] = createSignal(false)

  const increment = () => updateGame.add(game.bonus.click)
  const free = () => updateGame.add(game.bonus.free)
  const hover = () => {
    if (hoverActive()) {
      updateGame.add(game.bonus.hover)
    } 
  }

  setInterval(free,1000)
  setInterval(hover,1000)


  return (
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
      <h1 style="font-size: 2.5em">{game.count}<br/>
        <big onClick={increment} onMouseOver={() => setHoverActive(true)} onMouseLeave={() => setHoverActive(false)}>
          🍪
        </big>
      </h1>
      <For each={game.buyStuff}>
      {(stuff, i) => <StoreItem {...stuff} itemId={i()}/>}
      </For>
      <br/>
      <button onClick={(updateGame.resetGame)} >Reset Game</button>
    </div>
  );
}

function StoreItem(props:Item & {itemId:number}) {
  const textColor = () => {
    if (canBuy(props)) return "white"
    else return "gray"
  }
  return (
    <div style={`color: ${textColor()}; width: 400px; text-align: left; border-bottom: 1px solid #fff8; padding-bottom: 1em;`} 
      onClick={() => updateGame.buyItem(props.itemId)}>
      <h2>{props.emoji} {props.name}</h2>
      <Badge>
        {Icon[props.bonusType]} {props.bonusAmount}
      </Badge> 
      <Badge>
        Price: {props.cost}
      </Badge>
    </div>
  )
}

function Badge(props: { children: any }) {
  return (
    <span style="margin-right: .5em; border-radius: .5em; background: #0004; padding: 0 .5em .1em">
      {props.children}
    </span>
  )
}
render(() => <Counter />, document.getElementById("app")!);
