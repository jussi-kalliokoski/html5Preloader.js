describe 'html5Preloader', ->
  describe '[[constructor]]', ->
    it 'should create a new instance even if called without `new`.', ->
      expect( html5Preloader([], (->), (->)) instanceof html5Preloader ).toBe(true)
