const util = {
  createContext: function (canvas) {
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      return gl;
    }
    else {
      throw 'WebGLNotSupported';
    }
  },

  createProgram: function (gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    }
    else {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
      throw 'ProgramInitializationException';
    }
  },

  createShader: function (gl, path, type) {
    return new Promise(function (resolve, reject) {
      const request = new XMLHttpRequest();
      request.open('GET', path);
      request.responseType = 'text';
      request.onload = function () {
        if (request.status === 200) {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, request.response);
          gl.compileShader(shader);

          if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            resolve(shader);
          }
          else {
            gl.deleteShader(shader);
            reject(Error('Shader compilation failed: ' + gl.getShaderInfoLog(shader)));
          }
        } else {
          reject(Error('Unable to load shader at path "' + path + '": ' + request.statusText));
        }
      };
      request.send();
    })
  },

  createTexture: function (gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    if (typeof image !== "undefined") {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }

    return texture;
  },

  createFramebuffer: function (gl, texture) {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return framebuffer;
  },

  createProjectionMatrix: function (fieldOfViewInRadians, aspectRatio, near, far) {
    const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    const rangeInverse = 1 / (near - far);
    return [
      f / aspectRatio, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInverse, -1,
      0, 0, near * far * rangeInverse * 2, 0
    ];
  }
};