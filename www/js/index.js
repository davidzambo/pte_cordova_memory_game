/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

class Card {
    constructor(color) {
        this.color = color;
    }

    getColor() {
        return this.color;
    }
}

class Game {
    constructor(cards, layout, attemptCounter, timer) {
        this.cards = cards;
        this.layout = layout;
        this.attemptCounter = attemptCounter;
        this.timer = timer;
        this.init();
    }

    initResetButton() {
        const self = this;
        document.getElementById("reset").addEventListener("click", function () {
            self.init();
        });
    }

    init() {
        this.layout.generateLayout(CardPackUtil.randomizePack([...this.cards]))
        this.attemptCounter.setListener();
        this.attemptCounter.resetCounter();
        this.timer.resetTimer();
        this.initResetButton();
    }
}

class CardPackUtil {
    static randomizePack(cards) {
        return cards.concat(cards).sort((a, b) => 0.5 - Math.random())
    }
}

class CardListProducer {
    static getCardList() {
        const cards = [];
        cards.push(new Card("red"));
        cards.push(new Card("greenyellow"));
        cards.push(new Card("deepskyblue"));
        cards.push(new Card("hotpink"));
        cards.push(new Card("mediumpurple"));
        cards.push(new Card("orange"));
        cards.push(new Card("gold"));
        cards.push(new Card("black"));
        cards.push(new Card("white"));
        cards.push(new Card("cyan"));
        return cards.concat(cards);
    }
}

class CardLayout {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.isClickListenersEnabled = true;
    }

    generateLayout(cards) {
        this.parentElement.innerHTML = "";
        for (let i = 0; i < 5; i++) {
            this.parentElement.append(this.createRow(cards));
        }
    }

    createDiv(classList) {
        const div = document.createElement('div');
        div.classList = classList;
        return div;
    }

    createGameCard(card) {
        const gameCard = this.createDiv("game-card");
        const back = this.createDiv("game-card-back");
        const front = this.createDiv("game-card-front");

        front.style.background = card.getColor();
        gameCard.append(back, front);
        return gameCard;
    }

    createCard(card) {
        const self = this;
        const gameCardContainer = this.createDiv("col game-card-container");

        gameCardContainer.setAttribute("data-color", card.getColor());
        gameCardContainer.append(this.createGameCard(card));
        gameCardContainer.addEventListener("click", function () {
            const element = this;

            if (!self.isClickListenersEnabled || element.classList.contains("matched")) {
                return;
            }

            element.classList.toggle("selected");
            self.checkSelectedCards();
        }, false)

        return gameCardContainer;
    }

    createRow(cards) {
        const row = this.createDiv("row my-1");
        for (let j = 0; j < 4; j++) {
            row.append(this.createCard(cards.pop()));
        }
        return row;
    }

    checkSelectedCards() {
        const selectedCards = document.querySelectorAll(".selected:not(.matched)");

        if (selectedCards.length === 2) {
            this.setIsClickListenersEnabled(false);
            this.checkPairs(selectedCards);
        }
    }

    checkPairs(cards) {
        const self = this;
        if (cards[0].getAttribute("data-color") == cards[1].getAttribute("data-color")) {
            cards[0].classList.add("matched");
            cards[1].classList.add("matched");
        }

        setTimeout(function () {
            cards[0].classList.remove("selected");
            cards[1].classList.remove("selected");
            self.setIsClickListenersEnabled(true);
        }, 700);
    }


    setIsClickListenersEnabled(status) {
        this.isClickListenersEnabled = status;
    }
}

class Counter {
    constructor(htmlElement) {
        this.counter = 0;
        this.htmlElement = htmlElement;
        this.drawCounter();
    }

    increaseCounter() {
        this.setCounter(this.counter + 1)
    }

    resetCounter() {
        this.setCounter(0)
    }

    setCounter(num) {
        this.counter = num;
        this.drawCounter();
    }

    getCounter() {
        return this.counter;
    }

    drawCounter() {
        this.htmlElement.innerText = this.getCounter();
    }
}

class AttemptCounter extends Counter {
    constructor() {
        super(document.getElementById("attempt-counter"));
    }

    setListener() {
        const self = this;
        const cards = document.querySelectorAll(".game-card-container");

        cards.forEach(item => {
            item.addEventListener("click", function () {
            if (!item.classList.contains("matched"))
                self.increaseCounter();
            })
        })
    }
}

class Timer extends Counter {
    constructor() {
        super(document.getElementById("timer"));
        this.initInterval();
    }

    initInterval() {
        const self = this;
        this.interval = setInterval(function () {
            self.increaseCounter();
        }, 1000);
    }

    getCounter() {
        return this.getPaddedNumber(this.getMinutes()) + ":" + this.getPaddedNumber(this.getSeconds());
    }

    getSeconds() {
        return this.counter % 60;
    }

    getMinutes() {
        return Math.floor(this.counter / 60);
    }

    getPaddedNumber(number) {
        return number < 10 ? "0" + number : number;
    }

    resetTimer() {
        super.resetCounter();
    }
}

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    window.game = new Game(
        CardListProducer.getCardList(),
        new CardLayout(document.getElementById("layout")),
        new AttemptCounter(),
        new Timer()
    );
}
