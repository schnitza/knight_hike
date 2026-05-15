const WIDTH = 800
const HEIGHT = 800

let GAME_RUNNING = true
let STARTING_TIME, TIME_ELAPSED, ELO

function preload() {
  knt = loadImage("https://schnitza.github.io/assets/knight_vector.svg")
  sound_move = loadSound("https://schnitza.github.io/assets/place.mp3")
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  rectMode(CENTER);
  textAlign(CENTER)
  textSize(32)
  strokeWeight(0)
  knt.resize(60, 60)
  imageMode(CENTER)
  BOARD = new Chessboard(400,400,600)
  CURSOR = new Cursor(BOARD)
  KNIGHT = new Knight(BOARD)
  BOARD.generateLevel(LENGTH, MAX_PER_SQUARE)
  STARTING_TIME = performance.now()
}

function draw() {
  background(200);
  BOARD.render()
  CURSOR.update()
  KNIGHT.render()
  if (GAME_RUNNING) {
    TIME_ELAPSED = performance.now()-STARTING_TIME
    ELO = (3000 * (LENGTH / TIME_ELAPSED)) * 100 * (1 + (LENGTH/15)**2)
    fill(0)
    text((ELO).toFixed(2), 700, 750)
  } else {
    renderEndScreen()
  }
}

function mousePressed() {
  if (GAME_RUNNING && BOARD.squareExists(CURSOR.x, CURSOR.y) && BOARD.areInLshape(CURSOR.x, KNIGHT.x, CURSOR.y, KNIGHT.y)) {
    let total_health = 0
    for (let s of BOARD.squares) {
      if (s.x === CURSOR.x && s.y === CURSOR.y && s.health > 0) {
        s.health -= 1
        KNIGHT.x = s.x
        KNIGHT.y = s.y
        sound_move.play()
      }
      total_health += s.health
    }
    if (total_health<1) {
      GAME_RUNNING = false
    }
  }
}

function renderEndScreen() {
  fill(10,10,10,188)
  rect(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT)

  fill(255)
  textSize(64)
  text("Great Job, Magnus!", WIDTH/2, HEIGHT/2 - 100)
  textSize(32)
  text("Time elapsed: " + (TIME_ELAPSED/1000).toFixed(2), WIDTH/2, HEIGHT/2)
  textSize(32)
  text("ELO: " + (ELO).toFixed(0), WIDTH/2, HEIGHT/2-50)
}

class Knight {
  constructor(board) {
    this.board = board
    this.board.knight = this
    this.x
    this.y
    this.vx
    this.vy
    
  }
  render() {
    image(knt, this.vx, this.vy)
    this.vx = this.vx + (this.x-this.vx)/5
    this.vy = this.vy + (this.y-this.vy)/5
  }
  goto(x, y) {
    this.x = x
    this.y = y
    this.vx = x
    this.vy = y
  }
}

class Cursor {
  constructor(board) {
    this.board = board
    this.x = 0
    this.y = 0
  }
  update() {
    fill(70,70,70,128)
    let gs = this.board.square_size
    this.x = Math.round((mouseX + gs/8) / gs) * gs + this.board.x_offset - gs*2
    this.y = Math.round((mouseY + gs/8) / gs) * gs + this.board.y_offset - gs*2
    if (this.board.squareExists(this.x, this.y)) {
      rect(this.x,this.y,gs,gs)
    }
  }
}

class Chessboard {
  constructor(boardX, boardY, boardSize) {
    this.centerX = boardX
    this.centerY = boardY
    this.board_size = boardSize
    this.square_size = boardSize/8
    this.squares = []
    this.knight

    this.x_offset = this.centerX - this.board_size/2 + this.board_size/16
    this.y_offset = this.centerY - this.board_size/2 + this.board_size/16

    let square_fill = -255
    for (let i = 0; i < 8; i++) {
      let x = this.x_offset
      let y = this.y_offset + i*this.square_size
      for (let n = 0; n < 8; n++) {
        square_fill *= -1
        this.squares.push({"x": x, "y": y, "fill": square_fill, "outline": -square_fill, "health": 0})
        x += this.square_size
      }
      square_fill *= -1
    }
  }
  generateLevel(length, maxHealth) {
    let origin = this.squares[Math.floor(Math.random() * this.squares.length)]
    let current = origin
    this.knight.goto(origin.x, origin.y)
    for (let i = 0; i < length; i++) {
      let square_found = false
      while (!square_found) {
        let candidate = this.squares[Math.floor(Math.random() * this.squares.length)]
        if (candidate != origin && candidate.health < maxHealth && this.areInLshape(candidate.x, current.x, candidate.y, current.y)) {
          candidate.health += 1
          current = candidate
          square_found = true
        }
      }
    }
  }
  render() {
    for (let s of this.squares) {
      fill(s.outline)
      rect(s.x, s.y, this.square_size, this.square_size)
      fill(s.fill)
      rect(s.x, s.y, this.square_size-5, this.square_size-5)
      if (s.health > 0) {
        fill(s.outline)
        text(s.health, s.x, s.y+11)
      }
    }
  }
  squareExists(x, y) {
    for (let s of this.squares) {
      if (s.x === x && s.y === y) {
        return true
      }
    }
    return false
  }
  areInLshape(x1, x2, y1, y2) {
    if ((Math.abs(x1-x2) === this.square_size && Math.abs(y1-y2) === this.square_size*2) || (Math.abs(x1-x2) === this.square_size*2 && Math.abs(y1-y2) === this.square_size)) {
      return true
    } else {
      return false
    }
  }
}
