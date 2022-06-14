document.addEventListener("DOMContentLoaded", () => {
    fetchData();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        productosCarrito();
    }
});

const fetchData = async () => {
    try {
        const res = await fetch ('js/productos.json')
        const data = await res.json()
        dibujarProductos(data);
        botonComprar(data);

    } catch (error){
        //console.log(error)
    }
};

//Creacion catalogo de productos
const contenedorProductos = document.querySelector('#contenedor-productos');
const dibujarProductos = (data) => {
    const template = document.querySelector('#template-productos').content;
    const fragment = document.createDocumentFragment();
    console.log(template);

    data.forEach(producto => {
        template.querySelector('img').setAttribute('src', producto.thumbnailUrl);
        template.querySelector('h5').textContent = producto.nombre;
        template.querySelector('p span').textContent = producto.precio;
        template.querySelector('h6').textContent = producto.descripcion;
        template.querySelector('button').dataset.id = producto.id;

        const clone = template.cloneNode(true);
        fragment.appendChild(clone);
    })

    contenedorProductos.appendChild(fragment);
  };

  let carrito = {};


  //Comprar

  const botonComprar = (data) => {
        const botones = document.querySelectorAll('.card button');
        
        botones.forEach(btn => {
            btn.addEventListener('click', () => {
                const producto = data.find(item => item.id === parseInt(btn.dataset.id));
                producto.cantidad = 1;
                if (carrito.hasOwnProperty(producto.id)) {
                    producto.cantidad = carrito[producto.id].cantidad + 1
                };
                carrito[producto.id] = { ...producto };
                productosCarrito(); 
            })
        })
  };


// Carrito
  const items = document.querySelector('#items');
  const productosCarrito = () => {

    items.innerHTML = '';

    const template = document.querySelector('#template-carrito').content;
    const fragment = document.createDocumentFragment();

    Object.values(carrito).forEach(producto => {
        // console.log('producto', producto)
        template.querySelector('img').setAttribute('src', producto.thumbnailUrl);
        template.querySelectorAll('td')[0].textContent = producto.nombre;
        template.querySelectorAll('td')[1].textContent = producto.cantidad;
        template.querySelector('span').textContent = producto.precio * producto.cantidad;
        
        //botones
        template.querySelector('.btn-info').dataset.id = producto.id;
        template.querySelector('.btn-danger').dataset.id = producto.id;

        const clone = template.cloneNode(true);
        fragment.appendChild(clone);
    })

    items.appendChild(fragment);

    dibujarFooter();
    accionBotones();

    //Local Storage
    localStorage.setItem('carrito', JSON.stringify(carrito));
};


const footer = document.querySelector('#footer-carrito');
const dibujarFooter = () =>{
    footer.innerHTML = '';

    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `
        return;
    };

    const template = document.querySelector('#template-footer').content;
    const fragment = document.createDocumentFragment();

    // Sumar la cantidad y sumar total
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0);
    

    template.querySelectorAll('td')[0].textContent = nCantidad;
    template.querySelector('span').textContent = nPrecio;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);

    footer.appendChild(fragment);

    //Vaciar Carrito
    const boton = document.querySelector('#vaciar-carrito');
    boton.addEventListener('click', () => {
        Swal.fire({
            title: 'Estás seguro?',
            text: "Se borrarán todos tus productos",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText:'Cancelar',
            confirmButtonText: 'Sí, Borrar'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire(
                '¡Carrito Vacío!',
                'Tus productos fueron borrados',
                'success'
              );
              carrito = {}
              productosCarrito()
            }
          })
       
    });

    //Finalizar Compra
    const botonFinalizar = document.querySelector('#finalizar-carrito')
    botonFinalizar.addEventListener('click', () => {
        Swal.fire({
            title: '¿Desea finalizar su compra?',
            text: "Pagarás un total de $" + [nPrecio] ,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#05760f',
            cancelButtonColor: '#d33',
            cancelButtonText:'Cancelar',
            confirmButtonText: 'Finalizar'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire(
                '¡Compra Exitosa!',
                'Tus productos llegarán pronto',
                'success'
              )
              carrito = {};
              productosCarrito();
            }
          })
   })
   
};

//Botontes Agregar y Elminar en carrito
const accionBotones = () => {
    const botonesAgregar = document.querySelectorAll('#items .btn-info')
    const botonesEliminar = document.querySelectorAll('#items .btn-danger')


    botonesAgregar.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = carrito[btn.dataset.id]
            producto.cantidad ++
            carrito[btn.dataset.id] = { ...producto }
            productosCarrito();
        })
    })

    botonesEliminar.forEach(btn => {
        btn.addEventListener('click', () => {
            const producto = carrito[btn.dataset.id]
            producto.cantidad--
            if (producto.cantidad === 0) {
                delete carrito[btn.dataset.id]
            } else {
                carrito[btn.dataset.id] = { ...producto }
            }
            productosCarrito();
        })
    })
};
