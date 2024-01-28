import userProductModal from './userProductModal.js';

const {
  createApp, ref, onMounted, watch,
} = Vue;

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

//定義規則
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({
  generateMessage: localize('zh_TW'), //加入多國語系
  //validateOnInput: true, //輸入文字時，就立即進行驗證
});

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'wei-c';

createApp({
  setup() {
    const formRef = ref(null);
    const userProductModalRef = ref(null);
    // 從html取得的ref
    const loadingStatus = ref({
      loadingItem: '',
    });
    // loading狀態
    const products = ref([]);
    const product = ref({});
    const form = ref({
      user: {
        name: '',
        email: '',
        tel: '',
        address: '',
      },
      message: '',
    });
    const cart = ref({});

    const getProducts = () => {
      const url = `${apiUrl}/api/${apiPath}/products`;
      axios.get(url).then((response) => {
        products.value = response.data.products;
      }).catch((err) => {
        alert(err.response.data.message);
      });
    };

    const getProduct = (id) => {
      const url = `${apiUrl}/api/${apiPath}/product/${id}`;
      loadingStatus.value.loadingItem = id; //顯示loading icon
      axios.get(url).then((response) => {
        loadingStatus.value.loadingItem = ''; //移除loading icon
        product.value = response.data.product;
        userProductModalRef.value.openModal();
      }).catch((err) => {
        alert(err.response.data.message);
      });
    };

    const addToCart = (id, qty = 1) => {
      console.log('id',id)
      const url = `${apiUrl}/api/${apiPath}/cart`;
      loadingStatus.value.loadingItem = id;
      const cartData = {
        product_id: id,
        qty,
      };

      userProductModalRef.value.hideModal();
      axios.post(url, { data: cartData }).then((response) => {
        alert(response.data.message);
        loadingStatus.value.loadingItem = '';
        getCart();
      }).catch((err) => {
        alert(err.response.data.message);
      });
    };

    const updateCart = (data) => {
      console.log('update',data)
      loadingStatus.value.loadingItem = data.id;
      const url = `${apiUrl}/api/${apiPath}/cart/${data.id}`;
      const cartData = {
        product_id: data.product_id,
        qty: data.qty,
      };
      axios.put(url, { data: cartData }).then((response) => {
        alert(response.data.message);
        loadingStatus.value.loadingItem = '';
        getCart();
      }).catch((err) => {
        alert(err.response.data.message);
        loadingStatus.value.loadingItem = '';
      });
    };

    const deleteAllCarts = () => {
      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios.delete(url).then((response) => {
        alert(response.data.message);
        getCart();
      }).catch((err) => {
        alert(err.response.data.message);
      });
    };

    const getCart = () => {
      const url = `${apiUrl}/api/${apiPath}/cart`;
      axios.get(url).then((response) => {
        cart.value = response.data.data;
      }).catch((err) => {
        alert(err.response.data.message);
      });
    };

    const removeCartItem = (id) => {
      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      loadingStatus.value.loadingItem = id;
      axios.delete(url).then((response) => {
        alert(response.data.message);
        loadingStatus.value.loadingItem = '';
        getCart();
      }).catch((err) => {
        alert(err.response.data.message);
      });
    };

    const createOrder = () => {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = form.value;
      axios.post(url, { data: order }).then((response) => {
        alert(response.data.message);
        formRef.value.resetForm();
        getCart();
      }).catch((err) => {
        alert(err.response.data.message);
      });
    };

    watch(() => cart.value, (newCart) => {
      console.log('test');
      console.log('Cart updated:', newCart);
    });

    onMounted(() => {
      getProducts();
      getCart();
    });

    return {
      loadingStatus,
      products,
      product,
      formRef,
      userProductModalRef,
      form,
      cart,
      getProduct,
      addToCart,
      updateCart,
      deleteAllCarts,
      removeCartItem,
      createOrder,
    };
  },
}) 
  .component('v-form', Form) //註冊全域的表單驗證元件（VForm, VField, ErrorMessage）
  .component('v-field', Field)
  .component('error-message', ErrorMessage)
  .component('user-product-modal', userProductModal)
  .mount('#app');