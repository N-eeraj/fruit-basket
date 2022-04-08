const app = Vue.createApp({
    data() {
        return {
            inventory: [],
            cart: {
                items: [],
                totalPrice: 0
            }
        }
    },
    beforeMount() {
        fetch("https://n-eeraj.github.io/fruit-basket/data.json")
            .then(response => response.json())
            .then(data => data.forEach(item => this.inventory.push(item)))
    },
    methods: {
        calculateCartTotal() {
            let cart = this.cart
            let total = 0
            cart.items.forEach(item => total += item.price)
            cart.totalPrice = total
            console.log(cart)
        },
        updateInventory(index, itemCount) {
            let item = this.inventory[index]
            item.stock -= itemCount
            this.cart.items.push({
                name: item.name,
                count: itemCount,
                price: item.price * itemCount
            })
            console.log(this.inventory)
            this.calculateCartTotal()
        }
    },
    template: `
        <h1>Fruit Basket</h1>
        <div id="fruit_list">
            <fruit v-for="(fruit, index) in inventory" :fruit="fruit" :index="index" @stockChange="updateInventory" :key="index" />
        </div>
    `
})
app.component("fruit", {
    props: ["fruit", "index"],
    methods: {
        addToCart(index, stock) {
            let num = Number(prompt("Enter Number of items"))
            console.log(num < 1 || !Number.isInteger(num))
            if (isNaN(num))
                return alert("Enter a Number")
            if (num < 1 || !Number.isInteger(num))
                return alert("Invalid Number")
            if (num > stock)
                return alert(`Only ${stock} items in stock`)
            this.$emit("stockChange", index, num)
        }
    },
    template: `
        <div class="fruit-item">
            <img :src="fruit.image" />
            <div class="item-details">
                <span>{{fruit.name}}</span>
                <span>₹{{fruit.price}}/Kg</span>
                <button @click="addToCart(index, fruit.stock)">Add to Cart</button>
            </div>
        </div>
    `
})
app.mount("#app")