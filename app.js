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
            selectedItemCount: '',
            selectedItemIndex: null,
            showCart: false,
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
        closeModal() {
            this.prompt = false
            this.selectedItemCount = ''
            this.selectedItemIndex = null
        },
        getItemCount() {
            let num = this.selectedItemCount
            let stock = this.inventory[this.selectedItemIndex].stock
            if (isNaN(num) || num.length === 0)
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
            this.selectedItemCount = ''
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
        },
        cartToggle() {
            this.showCart = !this.showCart
        },
        placeBack(removalItem) {
            let cart = this.cart
            cart.items = cart.items.filter(cartItem => cartItem != removalItem)
            cart.totalPrice -= removalItem.price
            --cart.itemCount
            this.inventory.forEach(inventoryItem => {
                if (inventoryItem.name === removalItem.name)
                    inventoryItem.stock += removalItem.count
            })
        }
    },
    template: `
        <h1>Fruit Basket</h1>
        <div id="fruit_list" v-show="!showCart">
            <fruit v-for="(fruit, index) in inventory" :fruit="fruit" :index="index" @openModal="selectItem" :key="index" />
        </div>
        <button class="cart-toggle" :class="showCart?'':'show-count'" @click="cartToggle" :data-count="cart.itemCount">
            <i class="fa-solid" :class="showCart?'fa-house':'fa-basket-shopping'"></i>
        </button>
        <cart-list v-show="showCart" :cart="cart" @putBackItem="placeBack" />
        <div class="overlay" v-show="prompt">
            <div class="modal">
                <input type="number" placeholder="Enter Count" @keypress.enter="getItemCount" v-model="selectedItemCount" />
                <div>
                    <button @click="getItemCount">Continue</button>
                    <button @click="closeModal">Cancel</button>
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
                <button @click="this.$emit('openModal', index)" >Add to Cart</button>
            </div>
        </div>
    `
})
app.component("cart-list", {
    props: ["cart"],
    template: `<div class="cart">
            <h2>Your Cart</h2>
            <div class="cart-item-list">
                <cart-item v-for="item in cart.items" :item="item" @deleteItem="item => this.$emit('putBackItem', item)" />
            </div>
            <h3>Total: ₹{{cart.totalPrice}}</h3>
        </div>`
})
app.component("cart-item", {
    props: ["item"],
    template: `<div class="cart-item">
            <h4>{{item.name}}</h4>
            <span>{{item.count}} Kg</span>
            <span>₹{{item.price}}</span>
            <button @click="this.$emit('deleteItem', item)"><i class="fa-solid fa-trash-can"></i></button>
        </div>`
})
app.mount("#app")