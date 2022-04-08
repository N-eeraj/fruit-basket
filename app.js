const app = Vue.createApp({
    data() {
        return {
            inventory: [],
            cart: {
                items: [],
                itemCount: 0,
                totalPrice: 0
            },
            prompt: false,
            selectedItemCount: 0,
            selectedItemIndex: null,
            loading: true
        }
    },
    beforeMount() {
        fetch("https://n-eeraj.github.io/fruit-basket/data.json")
            .then(response => response.json())
            .then(data => {
                data.forEach(item => this.inventory.push(item))
                this.loading = false
            })
    },
    methods: {
        selectItem(index) {
            this.prompt = true
            this.selectedItemIndex = index
        },
        getItemCount() {
            let num = this.selectedItemCount
            let stock = this.inventory[this.selectedItemIndex].stock
            if (isNaN(num))
                return alert("Enter a Number")
            if (num < 1 || !Number.isInteger(num))
                return alert("Invalid Number")
            if (num > stock)
                return alert(`Only ${stock} items in stock`)
            this.prompt = false
            this.updateInventory(num)
        },
        updateInventory(itemCount) {
            let index = this.selectedItemIndex
            let item = this.inventory[index]
            item.stock -= itemCount
            this.selectedItemCount = 0
            console.log(this.inventory)
            this.addToCart(item.name, itemCount, item.price * itemCount)
            this.calculateCartTotal()
        },
        addToCart(name, count, price) {
            let cartItems = this.cart.items
            if (cartItems.map(item => item.name).includes(name)) {
                return cartItems.forEach(item => {
                    if (item.name === name) {
                        item.count += count
                        item.price += price
                    }
                })
            }
            cartItems.push({
                name: name,
                count: count,
                price: price
            })
            ++this.cart.itemCount
        },
        calculateCartTotal() {
            let cart = this.cart
            let total = 0
            cart.items.forEach(item => total += item.price)
            cart.totalPrice = total
            console.log(cart)
        }
    },
    template: `
        <h1>Fruit Basket</h1>
        <div id="fruit_list">
            <fruit v-for="(fruit, index) in inventory" :fruit="fruit" :index="index" @openModal="selectItem" @stockChange="updateInventory" :key="index" />
        </div>
        <button class="cart-toggle" :data-count="cart.itemCount"><i class="fa-solid fa-basket-shopping"></i></button>
        <div class="overlay" v-show="prompt">
            <div class="modal">
                <input type="number" placeholder="Enter Count" v-model="selectedItemCount" focus />
                <div>
                    <button @click="getItemCount">Continue</button>
                    <button @click="prompt=false">Cancel</button>
                </div>
            </div>
        </div>
        <div class="loader" v-if="loading"></div>
    `
})
app.component("fruit", {
    props: ["fruit", "index"],
    template: `
        <div class="fruit-item">
            <img :src="fruit.image" />
            <div class="item-details">
                <span>{{fruit.name}}</span>
                <span>₹{{fruit.price}}/Kg</span>
                <button @click="() => this.$emit('openModal', index)" >Add to Cart</button>
            </div>
        </div>
    `
})
app.mount("#app")